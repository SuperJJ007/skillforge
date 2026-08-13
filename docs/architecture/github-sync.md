# SkillForge GitHub 同步实现规范

> 状态：首版规范，实施待办<br>
> 更新日期：2026-08-13
> 权威范围：GitHub 仓库身份、快照、Webhook、调度、队列、额度、Worker、访问撤销与保留策略

本文是 [系统架构](system.md) 中 GitHub 同步子系统的唯一实现规范。产品承诺由 [产品权威](../authority/product.md) 维护，系统架构保留技术边界与验收目标；本文件唯一维护列级 schema、状态机、事务边界和运行参数。三者冲突时不得自行择一实现，必须先修正文档使其重新一致。

## 1. 边界与依赖

一个仓库可能包含多个资源；一个资源也可能引用源码仓库、文档仓库等多个仓库，因此不能在 `resources` 上只放一个 `repo` 字符串。

本规范依赖：

- [目录与分类](system.md#61-目录与分类) 提供 `resources` 及人工目录所有权。
- [提交与 Bench](system.md#64-提交与-bench) 提供 submission source identity 与触发入口。
- [Edge Function 部署与认证矩阵](system.md#75-edge-function-部署与认证矩阵) 规定 webhook/worker 的物理入口和认证方式。
- [GitHub 抓取设计](system.md#9-github-抓取设计) 规定抓取字段与页面语义；产品同步承诺见 [产品权威](../authority/product.md#3-已确定与待确认)。
- [容量假设与非功能指标](system.md#12-容量假设与非功能指标) 规定规模和 SLO。
- [GitHub 同步验收](system.md#github-同步) 规定交付门槛。

## 2. 精确数据模型

```text
repositories
- id UUID PRIMARY KEY
- provider ENUM(github) NOT NULL
- provider_node_id TEXT UNIQUE NOT NULL
- owner TEXT NOT NULL
- name TEXT NOT NULL
- canonical_url TEXT NOT NULL
- visibility ENUM(public, private, internal, unknown) NOT NULL
- access_state ENUM(accessible, access_uncertain, private, deleted, revoked, suspended) NOT NULL
- access_checked_at TIMESTAMPTZ NOT NULL
- access_invalidated_at TIMESTAMPTZ NULL
- latest_snapshot_id UUID NULL
- state_revision BIGINT NOT NULL DEFAULT 1
- created_at / updated_at
- CHECK((access_state = 'accessible' AND access_invalidated_at IS NULL) OR (access_state <> 'accessible' AND access_invalidated_at IS NOT NULL))
- CHECK(access_state <> 'accessible' OR visibility = 'public')

github_repository_resolution_jobs
- id UUID PRIMARY KEY
- repository_url_fingerprint TEXT NOT NULL
- normalized_owner TEXT NOT NULL
- normalized_name TEXT NOT NULL
- status ENUM(queued, leased, retry, succeeded, dead) NOT NULL
- priority SMALLINT NOT NULL DEFAULT 200
- generation BIGINT NOT NULL DEFAULT 1
- leased_generation BIGINT NULL
- available_at TIMESTAMPTZ NOT NULL
- attempts INTEGER NOT NULL DEFAULT 0
- max_attempts INTEGER NOT NULL
- leased_at TIMESTAMPTZ NULL
- lease_expires_at TIMESTAMPTZ NULL
- lease_owner TEXT NULL
- last_error_code TEXT NULL
- created_at / updated_at NOT NULL
- active partial UNIQUE(repository_url_fingerprint) WHERE status IN (queued, leased, retry)

github_repository_resolution_submissions
- id UUID PRIMARY KEY
- resolution_job_id UUID NOT NULL REFERENCES github_repository_resolution_jobs(id) ON DELETE RESTRICT
- submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE RESTRICT
- validation_epoch INTEGER NOT NULL
- association_state ENUM(active, completed, detached) NOT NULL DEFAULT active
- required_generation BIGINT NOT NULL
- joined_at TIMESTAMPTZ NOT NULL
- left_at TIMESTAMPTZ NULL
- partial UNIQUE(resolution_job_id, submission_id) WHERE association_state = active
- partial UNIQUE(submission_id) WHERE association_state = active
- CHECK((association_state = active AND left_at IS NULL) OR (association_state <> active AND left_at IS NOT NULL))

github_repository_resolution_catalog_requests
- id UUID PRIMARY KEY
- resolution_job_id UUID NOT NULL REFERENCES github_repository_resolution_jobs(id) ON DELETE RESTRICT
- catalog_validation_request_id UUID NOT NULL REFERENCES catalog_validation_requests(id) ON DELETE RESTRICT
- validation_epoch INTEGER NOT NULL
- association_state ENUM(active, completed, detached) NOT NULL DEFAULT active
- required_generation BIGINT NOT NULL
- joined_at TIMESTAMPTZ NOT NULL
- left_at TIMESTAMPTZ NULL
- partial UNIQUE(resolution_job_id, catalog_validation_request_id) WHERE association_state = active
- partial UNIQUE(catalog_validation_request_id) WHERE association_state = active
- CHECK((association_state = active AND left_at IS NULL) OR (association_state <> active AND left_at IS NOT NULL))

github_repository_resolution_attempts
- id UUID PRIMARY KEY
- resolution_job_id UUID NOT NULL REFERENCES github_repository_resolution_jobs(id) ON DELETE RESTRICT
- attempt INTEGER NOT NULL
- leased_generation BIGINT NOT NULL
- lease_owner TEXT NOT NULL
- started_at TIMESTAMPTZ NOT NULL
- finished_at TIMESTAMPTZ NULL
- status ENUM(running, succeeded, failed, rate_limited) NOT NULL
- request_count INTEGER NOT NULL DEFAULT 0
- error_code TEXT NULL
- resolved_repository_id UUID NULL REFERENCES repositories(id) ON DELETE RESTRICT
- UNIQUE(resolution_job_id, attempt)

github_apps
- app_id BIGINT PRIMARY KEY
- status ENUM(active, disabled) NOT NULL
- created_at / updated_at NOT NULL

github_webhook_recovery_jobs
- id UUID PRIMARY KEY
- app_id BIGINT NOT NULL REFERENCES github_apps(app_id) ON DELETE RESTRICT
- window_lower_bound TIMESTAMPTZ NOT NULL
- window_upper_bound TIMESTAMPTZ NOT NULL
- page_cursor TEXT NULL
- status ENUM(queued, leased, retry, succeeded, dead) NOT NULL
- priority SMALLINT NOT NULL DEFAULT 300
- generation BIGINT NOT NULL DEFAULT 1
- leased_generation BIGINT NULL
- available_at TIMESTAMPTZ NOT NULL
- attempts INTEGER NOT NULL DEFAULT 0
- max_attempts INTEGER NOT NULL
- leased_at / lease_expires_at TIMESTAMPTZ NULL
- lease_owner TEXT NULL
- last_error_code TEXT NULL
- created_at / updated_at NOT NULL
- UNIQUE(app_id, window_lower_bound, window_upper_bound)
- active partial UNIQUE(app_id) WHERE status IN (queued, leased, retry)

github_webhook_recovery_attempts
- id UUID PRIMARY KEY
- recovery_job_id UUID NOT NULL REFERENCES github_webhook_recovery_jobs(id) ON DELETE RESTRICT
- attempt INTEGER NOT NULL
- leased_generation BIGINT NOT NULL
- lease_owner TEXT NOT NULL
- started_at TIMESTAMPTZ NOT NULL
- finished_at TIMESTAMPTZ NULL
- status ENUM(running, succeeded, failed, rate_limited) NOT NULL
- listed_count / redelivery_count INTEGER NOT NULL DEFAULT 0
- request_count INTEGER NOT NULL DEFAULT 0
- error_code TEXT NULL
- UNIQUE(recovery_job_id, attempt)

github_webhook_redelivery_requests
- id UUID PRIMARY KEY
- app_id BIGINT NOT NULL REFERENCES github_apps(app_id) ON DELETE RESTRICT
- provider_delivery_id BIGINT NOT NULL（REST API 使用的数字 ID）
- delivery_guid TEXT NOT NULL（X-GitHub-Delivery GUID）
- status ENUM(queued, requested, confirmed, failed, abandoned) NOT NULL
- attempts INTEGER NOT NULL DEFAULT 0
- max_attempts INTEGER NOT NULL DEFAULT 3
- next_retry_at / last_requested_at TIMESTAMPTZ NULL
- last_error_code TEXT NULL
- created_at / updated_at NOT NULL
- UNIQUE(app_id, provider_delivery_id)
- UNIQUE(app_id, delivery_guid)
- CHECK((status IN (queued, failed) AND next_retry_at IS NOT NULL) OR (status = requested AND last_requested_at IS NOT NULL) OR status IN (confirmed, abandoned))

github_installations
- installation_id BIGINT PRIMARY KEY
- account_node_id TEXT NOT NULL
- repository_selection ENUM(all, selected) NOT NULL
- status ENUM(active, suspended, deleted) NOT NULL
- suspended_at / deleted_at TIMESTAMPTZ NULL
- updated_at TIMESTAMPTZ NOT NULL

github_installation_repositories
- installation_id BIGINT NOT NULL REFERENCES github_installations(installation_id) ON DELETE RESTRICT
- repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE RESTRICT
- access_state ENUM(accessible, removed, suspended) NOT NULL
- updated_at TIMESTAMPTZ NOT NULL
- PRIMARY KEY(installation_id, repository_id)

resource_repositories
- id UUID PRIMARY KEY
- resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE
- repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE RESTRICT
- role ENUM(primary, source, docs, benchmark) NOT NULL
- root_path TEXT NOT NULL DEFAULT ''
- manifest_path TEXT NOT NULL DEFAULT ''
- manifest_internal_key TEXT NOT NULL DEFAULT ''
- UNIQUE(resource_id, repository_id, role, root_path)
- 同一 resource 最多一个 role = primary

github_snapshots
- id UUID PRIMARY KEY
- repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE RESTRICT
- sync_run_id UUID NOT NULL REFERENCES github_sync_runs(id) ON DELETE RESTRICT
- head_sha TEXT NOT NULL
- default_branch TEXT NOT NULL
- description TEXT
- homepage_url TEXT
- topics JSONB
- primary_language TEXT
- languages JSONB
- stars_count / forks_count INTEGER
- is_fork / archived / disabled BOOLEAN
- license_spdx TEXT NULL
- pushed_at TIMESTAMPTZ NULL
- latest_release JSONB NULL
- community_profile JSONB NULL
- assembled_at TIMESTAMPTZ NOT NULL
- sync_status ENUM(ok, partial) NOT NULL
- error_code TEXT NULL
- UNIQUE(id, repository_id)

github_snapshot_parts
- snapshot_id UUID NOT NULL REFERENCES github_snapshots(id) ON DELETE CASCADE
- part ENUM(metadata, languages, release, community, artifacts) NOT NULL
- state ENUM(present, absent, reused, error, not_applicable) NOT NULL
- source_snapshot_id UUID NULL REFERENCES github_snapshots(id) ON DELETE RESTRICT
- fetched_at TIMESTAMPTZ NULL
- checked_at TIMESTAMPTZ NOT NULL
- error_code TEXT NULL
- PRIMARY KEY(snapshot_id, part)

github_artifacts
- id UUID PRIMARY KEY
- snapshot_id UUID NOT NULL REFERENCES github_snapshots(id) ON DELETE CASCADE
- path TEXT NOT NULL
- kind ENUM(readme, skill_manifest, mcp_manifest, plugin_manifest, citation, package, other_allowed) NOT NULL
- state ENUM(present, absent, reused, error) NOT NULL
- source_commit_sha TEXT NOT NULL
- blob_sha TEXT NULL
- source_artifact_id UUID NULL REFERENCES github_artifacts(id) ON DELETE RESTRICT
- raw_text_ciphertext BYTEA NULL
- sanitized_text TEXT NULL
- parsed_json JSONB NULL
- sensitive_scan_status ENUM(clean, redacted, blocked, not_scanned) NOT NULL
- parser_version TEXT NOT NULL
- fetched_at TIMESTAMPTZ NULL
- checked_at TIMESTAMPTZ NOT NULL
- error_code TEXT NULL
- UNIQUE(snapshot_id, path, parser_version)

resource_repository_artifacts
- resource_repository_id UUID NOT NULL REFERENCES resource_repositories(id) ON DELETE CASCADE
- github_artifact_id UUID NOT NULL REFERENCES github_artifacts(id) ON DELETE CASCADE
- usage ENUM(primary_manifest, readme, install, citation, dependency, auxiliary, shared_repository_doc) NOT NULL
- PRIMARY KEY(resource_repository_id, github_artifact_id, usage)

github_submission_validation_results
- id UUID PRIMARY KEY
- repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE RESTRICT
- snapshot_id UUID NOT NULL REFERENCES github_snapshots(id) ON DELETE RESTRICT
- root_path TEXT NOT NULL DEFAULT ''
- manifest_path TEXT NOT NULL DEFAULT ''
- manifest_internal_key TEXT NOT NULL DEFAULT ''
- claimed_type ENUM(skill, mcp, plugin) NOT NULL
- parser_version TEXT NOT NULL
- result_state ENUM(valid, needs_input) NOT NULL
- result_summary JSONB NOT NULL（只含 schema 校验后的安全字段）
- result_summary_sha256 TEXT NOT NULL
- validated_at TIMESTAMPTZ NOT NULL
- UNIQUE(id, snapshot_id)
- UNIQUE(id, snapshot_id, repository_id)
- FOREIGN KEY(snapshot_id, repository_id) REFERENCES github_snapshots(id, repository_id) ON DELETE RESTRICT
- UNIQUE(snapshot_id, root_path, manifest_path, manifest_internal_key, claimed_type, parser_version)

github_sync_runs
- id UUID PRIMARY KEY
- job_id UUID NOT NULL REFERENCES github_sync_jobs(id) ON DELETE RESTRICT
- repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE RESTRICT
- generation BIGINT NOT NULL
- sync_cycle_id UUID NULL
- trigger ENUM(submission, catalog, schedule, webhook, manual, access_revocation, public_confirmation) NOT NULL（本 run 领取时的最高优先级原因，未消费集合以 trigger 表为准）
- started_at TIMESTAMPTZ NOT NULL
- finished_at TIMESTAMPTZ NULL
- status ENUM(running, succeeded, partial, failed, rate_limited) NOT NULL
- request_count INTEGER NOT NULL DEFAULT 0
- error_summary TEXT NULL
- UNIQUE(id, repository_id)

github_http_cache
- id UUID PRIMARY KEY
- repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE RESTRICT
- endpoint TEXT NOT NULL
- request_url TEXT NOT NULL
- ref_or_query TEXT NOT NULL
- accept_media_type TEXT NOT NULL
- api_version TEXT NOT NULL
- auth_class ENUM(anonymous, installation) NOT NULL
- installation_id BIGINT NULL REFERENCES github_installations(installation_id) ON DELETE RESTRICT
- auth_context_key TEXT GENERATED ALWAYS AS (
    CASE
      WHEN auth_class = 'anonymous' THEN 'anonymous'
      ELSE 'installation:' || installation_id::text
    END
  ) STORED
- etag TEXT NULL
- last_modified TEXT NULL
- last_status INTEGER NOT NULL
- checked_at TIMESTAMPTZ NOT NULL
- last_used_snapshot_id UUID NULL REFERENCES github_snapshots(id) ON DELETE SET NULL
- CHECK((auth_class = 'anonymous' AND installation_id IS NULL) OR (auth_class = 'installation' AND installation_id IS NOT NULL))
- UNIQUE(repository_id, request_url, ref_or_query, accept_media_type, api_version, auth_context_key)

github_webhook_deliveries
- delivery_guid TEXT PRIMARY KEY（X-GitHub-Delivery）
- app_id BIGINT NOT NULL REFERENCES github_apps(app_id) ON DELETE RESTRICT
- provider_delivery_id BIGINT NULL（REST delivery numeric ID）
- event_name TEXT NOT NULL
- installation_id BIGINT NULL REFERENCES github_installations(installation_id) ON DELETE SET NULL
- payload_sha256 TEXT NOT NULL
- received_at TIMESTAMPTZ NOT NULL
- processed_at TIMESTAMPTZ NULL
- status ENUM(received, processed, ignored, failed) NOT NULL
- attempts INTEGER NOT NULL DEFAULT 0
- lease_owner TEXT NULL
- lease_expires_at TIMESTAMPTZ NULL
- last_error_code TEXT NULL
- updated_at TIMESTAMPTZ NOT NULL
- UNIQUE(app_id, provider_delivery_id)

github_webhook_delivery_jobs
- delivery_guid TEXT NOT NULL REFERENCES github_webhook_deliveries(delivery_guid) ON DELETE CASCADE
- job_id UUID NOT NULL REFERENCES github_sync_jobs(id) ON DELETE RESTRICT
- PRIMARY KEY(delivery_guid, job_id)

github_webhook_recovery_state
- app_id BIGINT PRIMARY KEY REFERENCES github_apps(app_id) ON DELETE RESTRICT
- completed_through TIMESTAMPTZ NOT NULL
- next_scan_at TIMESTAMPTZ NOT NULL
- last_checked_at TIMESTAMPTZ NOT NULL
- last_success_at TIMESTAMPTZ NULL

github_sync_jobs
- id UUID PRIMARY KEY
- repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE RESTRICT
- trigger ENUM(submission, catalog, schedule, webhook, manual, access_revocation, public_confirmation) NOT NULL（只记录创建 job 的首个原因）
- dedupe_key TEXT UNIQUE NOT NULL
- payload JSONB NOT NULL（只保存版本化执行/checkpoint schema，不保存 trigger 集合）
- status ENUM(queued, leased, retry, succeeded, dead) NOT NULL
- priority SMALLINT NOT NULL DEFAULT 100
- generation BIGINT NOT NULL DEFAULT 1
- required_sync_cycle_id UUID NULL
- required_sync_cycle_generation BIGINT NULL
- leased_generation BIGINT NULL
- available_at TIMESTAMPTZ NOT NULL
- attempts INTEGER NOT NULL DEFAULT 0
- max_attempts INTEGER NOT NULL
- leased_at TIMESTAMPTZ NULL
- lease_expires_at TIMESTAMPTZ NULL
- lease_owner TEXT NULL
- last_error TEXT NULL
- created_at / updated_at NOT NULL
- UNIQUE(id, repository_id)
- active partial UNIQUE(repository_id) WHERE status IN (queued, leased, retry)

github_sync_job_triggers
- id UUID PRIMARY KEY
- job_id UUID NOT NULL REFERENCES github_sync_jobs(id) ON DELETE RESTRICT
- generation BIGINT NOT NULL CHECK(generation >= 1)
- trigger ENUM(submission, catalog, schedule, webhook, manual, access_revocation, public_confirmation) NOT NULL
- source_key TEXT NOT NULL（delivery GUID、submission/catalog/request ID、schedule window 或安全事件键）
- reason_code TEXT NOT NULL
- priority SMALLINT NOT NULL
- payload JSONB NOT NULL（按 trigger 类型的版本化 schema 校验）
- consumed_at TIMESTAMPTZ NULL
- consumed_by_run_id UUID NULL REFERENCES github_sync_runs(id) ON DELETE SET NULL
- created_at TIMESTAMPTZ NOT NULL
- UNIQUE(job_id, generation)
- UNIQUE(job_id, trigger, source_key)
- CHECK((consumed_at IS NULL AND consumed_by_run_id IS NULL) OR consumed_at IS NOT NULL)
- INDEX(job_id, consumed_at, priority DESC, generation)

github_sync_job_submissions
- id UUID PRIMARY KEY
- job_id UUID NOT NULL REFERENCES github_sync_jobs(id) ON DELETE RESTRICT
- submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE RESTRICT
- validation_epoch INTEGER NOT NULL
- association_state ENUM(active, completed, detached) NOT NULL DEFAULT active
- required_generation BIGINT NOT NULL
- joined_at TIMESTAMPTZ NOT NULL
- left_at TIMESTAMPTZ NULL
- partial UNIQUE(job_id, submission_id) WHERE association_state = active
- partial UNIQUE(submission_id) WHERE association_state = active
- CHECK((association_state = active AND left_at IS NULL) OR (association_state <> active AND left_at IS NOT NULL))

github_sync_job_catalog_requests
- id UUID PRIMARY KEY
- job_id UUID NOT NULL REFERENCES github_sync_jobs(id) ON DELETE RESTRICT
- catalog_validation_request_id UUID NOT NULL REFERENCES catalog_validation_requests(id) ON DELETE RESTRICT
- validation_epoch INTEGER NOT NULL
- association_state ENUM(active, completed, detached) NOT NULL DEFAULT active
- required_generation BIGINT NOT NULL
- joined_at TIMESTAMPTZ NOT NULL
- left_at TIMESTAMPTZ NULL
- partial UNIQUE(job_id, catalog_validation_request_id) WHERE association_state = active
- partial UNIQUE(catalog_validation_request_id) WHERE association_state = active
- CHECK((association_state = active AND left_at IS NULL) OR (association_state <> active AND left_at IS NOT NULL))

repository_sync_policies
- repository_id UUID PRIMARY KEY REFERENCES repositories(id) ON DELETE RESTRICT
- tier ENUM(installed_daily, anonymous_priority, anonymous_standard, manual_only) NOT NULL
- auto_sync BOOLEAN NOT NULL
- desired_interval INTERVAL NOT NULL
- next_sync_at TIMESTAMPTZ NOT NULL
- priority SMALLINT NOT NULL DEFAULT 0
- last_scheduled_at TIMESTAMPTZ NULL
- last_success_at TIMESTAMPTZ NULL
- sync_cycle_id UUID NULL
- sync_cycle_job_id UUID NULL REFERENCES github_sync_jobs(id) ON DELETE RESTRICT
- sync_cycle_required_generation BIGINT NULL
- cycle_started_at TIMESTAMPTZ NULL
- expected_by_at TIMESTAMPTZ NULL
- last_priority_signal_at TIMESTAMPTZ NULL
- updated_at TIMESTAMPTZ NOT NULL
- CHECK((sync_cycle_id IS NULL AND sync_cycle_job_id IS NULL AND sync_cycle_required_generation IS NULL AND cycle_started_at IS NULL AND expected_by_at IS NULL) OR (sync_cycle_id IS NOT NULL AND sync_cycle_job_id IS NOT NULL AND sync_cycle_required_generation IS NOT NULL AND cycle_started_at IS NOT NULL AND expected_by_at IS NOT NULL))

github_rate_limit_buckets
- auth_class ENUM(anonymous, installation, app) NOT NULL
- installation_id BIGINT NULL REFERENCES github_installations(installation_id) ON DELETE RESTRICT
- app_id BIGINT NULL REFERENCES github_apps(app_id) ON DELETE RESTRICT
- auth_context_key TEXT GENERATED ALWAYS AS (
    CASE WHEN auth_class = 'anonymous' THEN 'anonymous'
         WHEN auth_class = 'installation' THEN 'installation:' || installation_id::text
         ELSE 'app:' || app_id::text END
  ) STORED
- resource TEXT NOT NULL
- state ENUM(unknown, ready, exhausted) NOT NULL
- limit_count INTEGER NOT NULL DEFAULT 0
- remaining INTEGER NOT NULL DEFAULT 0
- reserved INTEGER NOT NULL DEFAULT 0 CHECK(reserved >= 0)
- reset_at TIMESTAMPTZ NULL
- observed_at TIMESTAMPTZ NULL
- CHECK(
    (auth_class = 'anonymous' AND installation_id IS NULL AND app_id IS NULL) OR
    (auth_class = 'installation' AND installation_id IS NOT NULL AND app_id IS NULL) OR
    (auth_class = 'app' AND installation_id IS NULL AND app_id IS NOT NULL)
  )
- PRIMARY KEY(auth_context_key, resource)
- CHECK(limit_count >= 0 AND remaining >= 0 AND remaining <= limit_count)
- CHECK(
    (state = 'unknown' AND limit_count = 0 AND remaining = 0 AND reserved <= 1 AND reset_at IS NULL AND observed_at IS NULL) OR
    (state = 'ready' AND limit_count > 0 AND remaining > 0 AND reset_at IS NOT NULL AND observed_at IS NOT NULL) OR
    (state = 'exhausted' AND limit_count > 0 AND remaining = 0 AND reset_at IS NOT NULL AND observed_at IS NOT NULL)
  )

github_rate_limit_reservations
- id UUID PRIMARY KEY
- sync_job_id UUID NULL REFERENCES github_sync_jobs(id) ON DELETE RESTRICT
- resolution_job_id UUID NULL REFERENCES github_repository_resolution_jobs(id) ON DELETE RESTRICT
- recovery_job_id UUID NULL REFERENCES github_webhook_recovery_jobs(id) ON DELETE RESTRICT
- attempt INTEGER NULL（仅 work reservation）
- probe_sequence BIGINT NULL（仅 bootstrap/reset probe）
- auth_context_key TEXT NOT NULL
- resource TEXT NOT NULL
- reservation_kind ENUM(work, bootstrap_probe, reset_probe) NOT NULL
- estimated_cost INTEGER NOT NULL CHECK(estimated_cost > 0)
- lease_owner TEXT NOT NULL
- expires_at TIMESTAMPTZ NOT NULL
- status ENUM(active, reconciled, expired) NOT NULL
- CHECK((sync_job_id IS NOT NULL)::int + (resolution_job_id IS NOT NULL)::int + (recovery_job_id IS NOT NULL)::int = 1)
- CHECK((reservation_kind = 'work' AND attempt IS NOT NULL AND probe_sequence IS NULL) OR (reservation_kind IN ('bootstrap_probe', 'reset_probe') AND attempt IS NULL AND probe_sequence IS NOT NULL))
- FOREIGN KEY(auth_context_key, resource) REFERENCES github_rate_limit_buckets(auth_context_key, resource) ON DELETE RESTRICT
- partial UNIQUE(sync_job_id, attempt, auth_context_key, resource) WHERE reservation_kind = work
- partial UNIQUE(resolution_job_id, attempt, auth_context_key, resource) WHERE reservation_kind = work
- partial UNIQUE(recovery_job_id, attempt, auth_context_key, resource) WHERE reservation_kind = work
- partial UNIQUE(auth_context_key, resource) WHERE status = active AND reservation_kind IN (bootstrap_probe, reset_probe)

github_worker_invocations
- id UUID PRIMARY KEY
- pg_net_request_id BIGINT UNIQUE NOT NULL
- invoked_at TIMESTAMPTZ NOT NULL
- response_recorded_at TIMESTAMPTZ NULL
- status_code INTEGER NULL
- timed_out BOOLEAN NULL
- error_code TEXT NULL
- finished_at TIMESTAMPTZ NULL

github_worker_claim_state
- singleton BOOLEAN PRIMARY KEY DEFAULT true CHECK(singleton)
- next_kind ENUM(resolution, sync, recovery) NOT NULL
- updated_at TIMESTAMPTZ NOT NULL
```

以上按领域关系列示，不是 migration 的建表顺序。任何指向稍后列出的实体（例如 snapshot → run、run → job、trigger → run）的外键，都先建立两端表，再用 `ALTER TABLE` 加入；migration 必须在提交前验证全部约束已经存在，不能因循环依赖暂时省略后永久漏加。

## 2.1 Repository resolution

首次 submission 或 catalog validation request 只有经过严格语法校验的 GitHub owner/repo 与 URL fingerprint，还没有稳定 repository node ID，因此不能伪造 `repositories` 行，也不能直接创建要求 `repository_id` 的普通 sync job。`account-api/admin-api` 在创建业务目标的同一事务中按 fingerprint 创建或合并 `github_repository_resolution_jobs`，递增 job generation，并分别写带当前 `validation_epoch + required_generation` 的 active submission/catalog-request junction；同一仓库的多个用户、import item、draft 或 monorepo 资源保留各自业务目标，但共享一次 metadata lookup。每个业务目标在 resolution 和普通 sync 两个阶段各自最多一个 active association；junction 使用独立 UUID 与 partial unique，因此 completed/detached 历史行不阻止后续重新并入同一个 job。

Resolution 与普通 sync 使用同一个 service-only `claim_github_work(worker_id, batch_size)`、rate-limit bucket、reservation 安全余量、lease TTL、owner-CAS 和 generation 合同。首版 resolution 只允许匿名公共 metadata 请求；它不读取内容，不创建 snapshot，也不把 URL 当成稳定身份。Claim resolution work 时创建 `github_repository_resolution_attempts`，而不是提前创建要求稳定 repository identity 的 `github_sync_runs`。

Worker 对固定 GitHub API 主机执行 metadata lookup 后，在一个数据库事务中：

1. 以 `provider_node_id` upsert `repositories`，取得唯一稳定 repository ID；仓库改名只更新 owner/name/canonical URL。
2. 将 attempt 标为 succeeded；若别的 resolution 已建立同一 node ID，复用 winner repository，不创建重复行。
3. 锁定 `association_state = active AND required_generation <= leased_generation` 且 identity 与 `validation_epoch` 都未改变的 submission/catalog request，写入 `resolved_repository_id`；任一已改变的 association 原子标为 `detached`。
4. 对 submission 根据 node ID、root path、manifest path 与 internal key 只计算并写 `candidate_dedupe_key`；未经 valid target validation 不取得 canonical winner，也不创建 duplicate。Catalog request 不参与 submission 去重，只保存解析后的 repository identity。
5. 按第 2.2 节检查精确 target 是否存在仍可复用的 validation result；命中时绑定 current evidence 并按业务目标推进。Submission 的 `valid` 结果才在 canonical lock 下进入 review/winner 仲裁，`needs_input` 保持 provisional；catalog request 则进入 `valid/needs_input`，不直接发布目录。
6. 未命中复用条件时，为 winner repository 创建或合并普通 `github_sync_jobs`，递增其 generation，并把每条仍需验证的 submission/catalog request 写入对应 active sync junction；resolution association 同时标为 `completed`。后续 attempt 固定 head SHA、抓取内容并形成 snapshot，完成时据各自 junction推进状态。
7. 最后按 owner-CAS 检查 resolution job generation：若 `generation = leased_generation` 且没有晚到的 active association，则标为 `succeeded`；若 generation 已增长，则清 lease 回到 `queued`，由下一 attempt 处理 `required_generation > leased_generation` 的新关联。

任一步失败则整笔回滚；已被 PATCH/retry 到新 fingerprint 或 epoch 的业务目标不能被旧 resolution 回写。Mutation 在同一事务把旧 active association 标为 `detached` 后才能创建新关联。可修复的 404、格式或路径问题转为 `needs_input` 并结束对应 association；网络/secondary-limit 等临时错误保持 active 并进入 retry。耗尽 `max_attempts` 时，dead-job reconciler 把当时 active 的关联标为 `completed`，将仍匹配的业务目标改为 `validation_failed` 并写相应审计；管理员显式 retry 时先确认不存在 active association，再创建或合并新的 resolution work。Resolution job、attempt 与两类关联表服从第 13 节 retention closure。

## 2.2 Target validation reuse

“同仓库 6 小时最多启动一次昂贵 target validation attempt”由 append-only `github_submission_validation_results` 实现，不由 active-job unique 粗略代替。Repository resolution 的 metadata lookup 仍会执行，用于确认稳定 node ID、当前公开访问和重命名；取得 repository ID 后，只有同时满足以下条件才复用既有结果：

- 精确匹配 `repository_id + normalized root_path + manifest_path + internal_key + claimed_type + parser_version`；仓库级 snapshot 不能替代目标级 coverage。
- `validated_at >= now() - interval '6 hours'`，`snapshot_id = repositories.latest_snapshot_id`、head 与 latest 一致，snapshot 尚在 retention closure，且 repository 当前 `visibility = public AND access_state = accessible`。
- Coverage 为 schema 校验后的 `valid` 或可安全重放的 `needs_input`；缺目标 artifact、parser 版本变化或 result summary 不完整时必须重新抓取。
- Coverage 之后没有尚未消费的 push/webhook generation，也没有同仓库 active sync job 指示可能有更新；无法证明无更新时不复用。

命中时在业务目标当前 epoch 的同一事务绑定 `current_validation_result_id` 并复制安全 summary。Submission 同时写 `current_validation_epoch` 与 `validation_completed`：result 为 `valid` 时在 canonical lock 内仲裁并进入 `review/duplicate`，为 `needs_input` 时保留 provisional key并进入 `needs_input`；catalog request 则进入 `valid/needs_input`。不创建 sync run或消耗内容抓取额度。未命中则按步骤 6 合并普通 sync work。同一 repository 的不同 path/internal key/type 只有各自 coverage，攻击者不能用一个热门路径的缓存压住其他合法资源。

Validation result 是 append-only 证据：完成事务只允许 `INSERT`；同一 snapshot/target/parser 唯一键已存在时，只有 canonical `result_summary_sha256` 完全相同才可幂等复用，内容不同视为完整性错误并告警，不能 UPDATE 旧行。数据库的 composite FK 保证 result repository 与 snapshot repository 相同；publication event 再以 `(validation_result_id, snapshot_id)` composite FK 保证两者是同一证据。无 FK root 的 result 也至少保留到 `validated_at + 6 hours`，活动 submission/catalog request 的 current pointer 与 accepted/published event 分别成为审核期和发布后的 retention root。

Publication freshness 与复用使用同一默认 6 小时窗口，还要求 result 指向当前 latest snapshot/head，且其后没有 `github_sync_job_triggers.consumed_at IS NULL` 的更新 trigger 或 active update work；任一条件失败都必须走 revalidate，不得用“仍在 30 天 snapshot retention 内”冒充 current。配置变更必须版本化并进入容量/滥用回归。

## 3. Repository source identity 与 monorepo

`root_path` 标识 monorepo 中资源的根目录，`manifest_path` 标识该资源的主清单；两者必须是规范化的仓库相对路径，禁止绝对路径、`..` 和 URL 编码绕过。artifact 先属于某次 snapshot，再通过 `resource_repository_artifacts` 关联具体资源入口，避免同仓库多个 Skill/MCP/Plugin 混在一起。

对 `resource_repositories` 建两条 partial unique index：

- 每个 resource 最多一个 `role = primary`。
- `(repository_id, root_path, manifest_path, manifest_internal_key) WHERE role = primary` 全局唯一。

第二条索引定义规范化 source identity。一个 manifest 合法产出多个资源时，解析器必须给出稳定 `manifest_internal_key`，不能通过创建两个无差别 resource 绕过唯一约束。当前产品要求每个 `published` 资源恰好有一个 primary repository；草稿阶段可以没有，详情页此时明确显示“尚未关联主仓库”。

## 4. Snapshot 状态机与发布

一次同步先固定默认分支 `head_sha`，README、manifest 和其他 commit-bound 内容一律使用 `ref=head_sha` 读取。只有已得到非空 `default_branch + head_sha` 才能创建 `github_snapshots`；空仓库、无法解析 head 或 head 在抓取中消失的 attempt 进入 failed/needs-input 而不生成可发布 snapshot。metadata 与 artifacts 必须绑定同一个 `sync_run_id` 和 snapshot；每个 part 单独记录 `present/absent/reused/error/not_applicable`、原始 `fetched_at` 和本次 `checked_at`。文件在该 commit 已删除时写 `absent` tombstone，页面不能回退选择旧 artifact；`reused` 必须显式指向旧来源。

state-dependent CHECK 与 deferred trigger 必须保证：

- `reused` 必须直接指向同一 repository、同一 part，或同 path/kind/parser 的更早 terminal `present` 来源，最大链深为 1；禁止指向另一个 `reused`、自指或跨仓库引用。
- part 的 `present` 要有 `fetched_at`；`reused` 要有来源；`error` 要有 `error_code`。
- artifact 的 `present` 要有 `blob_sha`、`fetched_at` 和已完成敏感信息扫描；`reused` 只保留 source pointer；`error` 要有 `error_code`。
- `absent/not_applicable` 不带 source、blob、正文、parsed data 或 error；tombstone 查询绝不沿旧 source 回退。

可发布性不得由 Worker 自由判断，首版固定为下表：

| Part | 必需性 | 可进 latest 的状态 | 附加条件 |
| --- | --- | --- | --- |
| `metadata` | 必需 | `present` / `reused` | `default_branch` 和 `head_sha` 非空，且与 run/repository 一致；`absent/error/not_applicable` 使 run 失败 |
| `artifacts` | 必需 | `present` / `reused` | 已对允许列表完成本 head 的有界枚举；每个 published primary manifest 和 active validation target 都有精确 artifact 行 |
| `languages` | 可选 | 任一终态 | `error` 可发布为 partial；`absent/not_applicable` 是可解释结果 |
| `release` | 可选 | 任一终态 | 无 release 使用 `absent`；endpoint 错误时可 partial |
| `community` | 可选 | 任一终态 | fork 等不适用场景使用 `not_applicable`；error 时可 partial |

`artifacts` part 成功不等于每个文件都存在：在固定 head 上确认删除的文件写 `absent` tombstone，并仍可让 snapshot 成为 latest，但对应 target validation 不得产生 `valid`。任一 published primary manifest 或 active validation target 为 `error`、未扫描的可疑敏感内容或没有完整 artifact 行时，本 run 不得更新 latest；只有 README、可选 package/citation 或可选 part 的错误/大小限制才是“明确允许的 partial”。`sync_status = ok` 要求必需项成功且没有可选 error/limit；`sync_status = partial` 只允许上述可选降级。每个 snapshot 必须恰有表中五个 part 行。

只有通过上述可发布矩阵时，才在一个事务中更新 `repositories.latest_snapshot_id`。建表后用 `ALTER TABLE` 增加复合外键 `(repositories.latest_snapshot_id, repositories.id) REFERENCES github_snapshots(id, repository_id)`；`github_snapshots` 上的 `UNIQUE(id, repository_id)` 是前置条件。失败的 sync run 不能产生 latest，页面始终读取 latest snapshot 的整套 part/artifact，不混用新旧版本。

repository identity 必须沿整条链闭合：使用复合外键 `(github_sync_runs.job_id, repository_id) REFERENCES github_sync_jobs(id, repository_id)` 和 `(github_snapshots.sync_run_id, repository_id) REFERENCES github_sync_runs(id, repository_id)`；因此 jobs、runs、snapshots 都显式声明对应 pair unique。资源关联的 artifact/snapshot repository 等于 `resource_repositories.repository_id` 这一跨多表不变量由 deferred constraint trigger 校验。artifact 路径必须位于该关联的 `root_path` 下；仓库级 README 等例外只能显式标为 `shared_repository_doc`，不能靠路径匹配失败后自动共享。

## 5. Conditional HTTP cache

ETag 是跨同步运行的 HTTP 表示缓存，按稳定请求 URL、ref/query、Accept、API version 和认证上下文持久化，不能只放在单次 sync run。`304` 只更新 `checked_at`，沿用原值与原 `fetched_at`，不能制造一次新的内容抓取；是否消耗额度以实际 rate-limit headers 为准，不作无条件假设。

`auth_context_key` 由数据库生成，不能由调用方自由填写。使用 installation 缓存前必须确认该 installation 与 repository 关系仍为 active；暂停、删除或移除事件立即使对应认证上下文缓存失效。

### 5.1 Fetch safety limits

首版抓取器固定限制 README 1 MiB、其他文本清单 256 KiB、目录深度 4、单次最多 500 个目录项。超过限额必须写明确 error/limit code，不静默截断后假装完整；README 或其他可选 artifact 超限可按第 4 节矩阵发布 `partial`，published primary manifest 或 active validation target 超限则不得更新 latest。参数升级只修改本规范和版本化 parser 配置；产品架构不复制数值。

## 6. Webhook ingress 与 fan-out

Webhook 和定时任务写入持久化数据库队列；Edge Function 返回后不依赖内存 Promise 继续运行。Worker 使用租约领取任务，超时可重试，超过 `max_attempts` 进入 `dead` 并告警。Webhook delivery 去重记录与队列插入必须在同一事务中完成。

Webhook delivery 与 job 是一对多而不是一对一。`installation` 事件可以没有单一 repository，`installation_repositories` 也可能一次增删多个仓库；验签后先以 `X-GitHub-Delivery` 的 GUID 去重，再在一个数据库事务中更新 installation/access 状态并为 0..N 个受影响 repository 合并任务，最后写 `github_webhook_delivery_jobs`。delivery 可以合法地产生零个 job，但不能因为没有 repository 而丢掉授权撤销事件；保留期和删除顺序统一见第 13 节。

同一 delivery GUID 再次到达时先校验 `app_id + payload_sha256`，不一致视为安全事件并拒绝；一致时在行锁内处理：`processed/ignored` 直接 2xx no-op，`received` 且 lease 未过期表示已有处理者，`failed` 或过期 `received` 可以原子重新领取、递增 attempts 并执行同一事务化 fan-out。成功后清 lease 并写 `processed/ignored`，同时把同 GUID 的 redelivery request 标为 `confirmed`；失败写公开 error code 而不保存完整 payload。

后台 recovery 不是旁路脚本。`github_webhook_recovery_state.completed_through` 是上一个完整成功窗口的时间水位，初始化不得早于 GitHub 可重投范围 `now() - 3 days`。Cron 到期时冻结 `window_lower_bound = completed_through` 与 `window_upper_bound = transaction_timestamp()`，幂等创建或合并每 App 唯一 active 的 recovery job；分页 continuation 只更新该 job 的 `page_cursor`，不能移动上下界。Worker 以 provider 的 `delivered_at` 从最新 delivery 向后扫描，忽略 `delivered_at >= upper` 的并发新记录，直到覆盖 `delivered_at < lower`；整窗全部成功后才原子执行 `completed_through = window_upper_bound`、清 page cursor并推进 `last_success_at/next_scan_at`。Quota defer、失败或强杀保留原窗口和 cursor；若 lower 已落在三天可见窗之外则告警并把缺口记为不可自动恢复，不能假装无遗漏。

Recovery job 由同一个 `claim_github_work` 以 `app:{app_id}` rate bucket、App JWT、reservation、lease 和 attempt 合同执行。REST 返回的数字 `provider_delivery_id` 与 header GUID 分栏保存；调用 redelivery endpoint 时只使用数字 ID，入站去重仍只使用 GUID。

Recovery work 每次先 drain 本 App 中到期的持久 redelivery requests，再扫描新窗口；Cron 在存在到期 request 时即使 `next_scan_at` 未到也会幂等唤醒 recovery job。因此窗口成功只要求所有发现的失败 delivery 已形成 durable request，不会让一次 POST 失败因水位推进而失去执行者。Drain 集合包括 `status IN (queued, failed) AND next_retry_at <= now()`，也包括 `status = requested AND last_requested_at + confirmation_timeout <= now()`；后者先按 GUID/provider 状态 reconcile，已成功入站则标 `confirmed`，否则原子回到 `failed` 并计算下次退避或在 attempts 达上限时标 `abandoned`。`processed/ignored` 或未过期 `received` 同样确认 request；其余才调用 redelivery。每个 provider delivery 最多请求 3 次并服从 App quota、`Retry-After` 和 GitHub 三天可用时间窗；失败写 `failed + next_retry_at`，超限、窗口结束或连续失败进入 `abandoned` 并告警。Redelivery 回到上一段同一个 HMAC、GUID 行锁和 fan-out 状态机，不建立第二份业务事件。`confirmation_timeout` 首版固定 10 分钟并只在本规范维护。每日仓库兜底只保证数据新鲜度，不能替代 delivery recovery。Recovery 巡检和 webhook handler 都不能等待完整 repository sync。

## 7. Scheduling policy

`repository_sync_policies` 是[分层同步承诺](system.md#95-同步策略)的持久状态。Cron 只做 `auto_sync = true AND next_sync_at <= now()` 的 due scan 与幂等 enqueue；可以按队列深度和最近 bucket 观察值做粗粒度节流，但不得把它称为真实 quota 判定。只有 job 成功 insert 或 merge 后才更新 `last_scheduled_at/next_sync_at`，未成功入队绝不推进 schedule。

`sync_cycle_id/sync_cycle_job_id/sync_cycle_required_generation/cycle_started_at/expected_by_at` 表达尚未满足的最早同步周期：只有当前没有 unresolved cycle 时，首次成功 enqueue 才创建 cycle，并以本次 due boundary 加该 tier 的 grace 计算并冻结 deadline；enqueue/merge 先递增 job generation，再把 job ID、cycle ID 与该 generation 分别写入 policy 和 job，claim 再把 cycle ID 复制到 `github_sync_runs`（run 自身已有 job ID/generation）。后续 Cron 对同一 queued/retry/leased job 的 merge 只推进日历上的 `next_sync_at`，绝不能覆盖旧 cycle/deadline。若绑定 job 进入 `dead` 而 cycle 未满足，replacement enqueue 必须保留原 cycle/deadline，并在一个 policy/job 行锁事务内把 `sync_cycle_job_id` rebind 到新 job、把 required generation 改为新 job 本次 enqueue 后的 generation。只有成功发布 snapshot 的完成事务同时满足 `run.job_id = policy.sync_cycle_job_id`、`run.sync_cycle_id = policy.sync_cycle_id`、`run.generation >= policy.sync_cycle_required_generation`、snapshot 属于该 run/head 时，才能以 CAS 清除旧 cycle；较早/旧 job/manual/null-cycle run 都不能误清。失败、quota defer或 generation merge保留原值。页面 stale 判定因此读取最早未满足周期，不会被后续 Cron 推迟。

`manual_only` 必须为 `auto_sync = false`。只有成功 sync 才更新 `last_success_at`；本轮失败不能通过推进 next_sync_at 延迟 stale 提示。installation added/active、removed/suspended/deleted 事件在更新访问权限的同一事务中迁移 tier、interval、auto_sync 与 next_sync_at。浏览详情产生的优先级信号按 repository 节流，默认 24 小时最多提升一次，不能让刷新页面无限入队。

## 8. Quota reservation 与 reset probe

Worker 的 `claim_github_work` 是 repository resolution、普通 sync 与 webhook recovery 共用的唯一 GitHub quota 权威。`github_rate_limit_buckets` 不只保存观察值：candidate claim、quota bucket 行锁、写 `github_rate_limit_reservations` 和 work lease 必须在同一个 claim 事务中完成。只有 `state = ready AND remaining - reserved - estimated_cost > safety_margin` 才能新建 work reservation；这是持有 bucket 行锁时的 claim 前置条件，不是一个会阻止新 provider header 落库的行约束。`reserved` 始终由受控函数维护为同 bucket 全部 active reservation 的 `estimated_cost` 之和，并由定期 reconcile 校验。响应后以 `work_kind + work_id + attempt + lease_owner` 在一个 bucket 行锁事务中先对账并释放本 reservation，再无条件接受可信 rate-limit header 的 `remaining/reset_at/observed_at`。若新 header 为 `remaining = 0` 而其他 work 仍在途，bucket 合法进入 `exhausted` 且允许 `reserved > remaining`；它只阻止新 claim，现有 reservation 随后各自对账。失败/强杀后，回收过期 work lease 的同一事务把对应 active reservation 标为 expired 并扣回 `reserved`。claim 失败不产生 reservation。

额度不足时不得创建 work reservation 或 run/attempt，不得递增 `attempts`，也不得把 job 置为 `leased`；同一事务把 job 保持在 `queued/retry`，并把 `available_at` 推到 rate-limit reset、`Retry-After` 或带 jitter 的 probe backoff，然后继续寻找其他 auth context 的候选。schedule、webhook、submission、manual 和 recovery 只影响优先级与触发原因，全部服从同一个 claim/reservation 入口。

首次出现 anonymous、新 installation 或 App auth context 时，事务先插入 `state = unknown, limit_count = remaining = reserved = 0` 的 bucket。Unknown bucket 不允许普通 work reservation，只允许每个 context/resource 唯一 active 的 `bootstrap_probe(cost=1)` 与一个候选 work 绑定；其余同 context work defer。Probe claim 只短租候选并分配 `probe_sequence`，不递增 job attempts、不创建 run/attempt；Worker 只发送一个低成本 metadata/list 请求。响应只用于可信 rate-limit headers并丢弃业务 body，不写入没有统一 schema 的“probe cache”；bucket 初始化为 `ready/exhausted` 并释放 probe后，正式 work 必须在完整 reservation 下重新请求并按正常条件缓存/快照合同处理。Probe 失败则释放短租、保持 unknown并写退避，不能假设默认满额。

当 ready/exhausted bucket 的 `now() >= reset_at` 且没有新 headers 时，也不直接把额度恢复为满额：每个 auth context/resource 只允许一个原子取得的 `reset_probe(cost=1)`，同样不递增业务 attempts 或创建 run；成功响应后用新 headers 重置 bucket，再回普通 claim，探针失败则按退避更新 `available_at`。`Retry-After` 与 secondary-limit 退避同样落在 work。Reservation 对 `(auth_context_key, resource)` 的复合 FK 与唯一 active probe 约束让悬空或并发探针在数据库层失败。该机制只降低并发超发风险，GitHub 仍是最终额度权威。

## 9. Worker invocation

第一版 Worker 的执行载体固定为 Supabase Edge Function `github-sync-worker`：

- Supabase Cron 使用 `pg_cron`：一个数据库任务把到期仓库幂等写入 `github_sync_jobs`，一个任务按 recovery state 创建到期 `github_webhook_recovery_jobs`，另一个任务每分钟通过 `pg_net` 唤醒 Worker。
- Cron 调用凭据保存在 Vault；Worker 使用 Supabase named secret key `github-sync-worker`，通过 `apikey` header 和 `auth: 'secret:github-sync-worker'` 校验，不接受浏览器直接调用，也不冒充普通用户。
- `pg_net.http_post` 显式设置 `timeout_milliseconds = 120000`，高于 90 秒应用预算且低于 5 分钟 lease；不依赖扩展默认值（当前 upstream `http_get/http_post` 默认是 1000 ms）。每次调用把 invocation 与返回的 pg_net request ID 写入 `github_worker_invocations`；巡检短期 `net._http_response` 后立即回填持久结果并据此告警，不能把 `net` 表当长期审计日志。部署时固定并检查实际安装的 extension version 与函数签名。
- 单次调用应用级硬预算为 90 秒，到达 75–80 秒后停止领取新任务；初始每次只领取 1–3 个 resolution/sync/recovery work item。首版不另设一套全局 slot 表，claim 批次、work lease、quota reservation 与 Edge 平台并发上限共同约束并发。
- 单个 GitHub HTTP 请求设置独立超时。超过本次预算时，以 owner-CAS 把同一 work item 转为 `retry`，并在受 schema 校验的 payload 中记录尚未处理的 part；首版不创建没有数据模型支撑的隐式 part job，不能让一个仓库占满函数生命周期。
- Worker 返回前持久化 `succeeded / retry / dead`；预算耗尽时以 owner-CAS 主动转为 `retry` 并清租约。平台强杀时不假设清理回调会运行，只能依赖 `lease_expires_at` 回收。
- 正确性不依赖 `EdgeRuntime.waitUntil`、内存 Promise 或浏览器请求持续在线。

## 10. Queue state machine

每次 Worker 只能通过 service-only `claim_github_work(worker_id, batch_size)` 函数取任务。函数从 resolution、sync 与 recovery 三类候选中选择，在同一事务对实际目标表使用 `FOR UPDATE SKIP LOCKED`，并接受 `(status IN (queued, retry) AND available_at <= now()) OR (status = leased AND lease_expires_at <= now())`。有额度时，同事务完成 quota reservation，原子写 lease/generation、递增 attempts，并按类型创建 resolution attempt、带 `required_sync_cycle_id` 副本的 sync run 或 recovery attempt；同时只把 submission/catalog work 下 active、generation 与 epoch 均匹配且业务目标仍为 `received` 的行推进为 `validating`，submission 另写 `validation_started` review event，最后 `RETURNING`。Quota defer 不改变业务状态，也不伪造 started event。过期回收、reservation 释放和 claim 必须同事务；续租与完成继续使用 owner-CAS。这样每分钟 Cron 与 90 秒 Worker 重叠也不会重复领取，三类 work 也不能各自看到同一份额度。

Priority 数值越大越先处理；基础等级固定为 access-revocation/public-confirmation 400、webhook recovery 与 webhook-triggered sync 300、manual/submission/catalog validation 200、schedule 100。创建 job 时必须同事务写入 generation 1 的 `github_sync_job_triggers`；任何新 trigger 合入 existing job 都在同事务递增 `generation`、写入唯一 `(job_id, generation)` trigger 行，并执行 `priority = GREATEST(existing_priority, incoming_priority)`。`payload` 只保存该 trigger 类型已登记 schema 允许的最小参数，不得用自由 JSON 代替 generation/source identity。成功 attempt 完成事务把 `generation <= leased_generation` 的未消费 trigger 标为 `consumed_at/consumed_by_run_id`；若还有 `consumed_at IS NULL` 行，job 的基础 priority 重算为其最大 `priority` 并回 `queued`，否则才进终态。失败/retry attempt 不消费 trigger。查询使用 `effective_priority = base_priority + min(floor(wait_minutes / 15), 250)`，同分按 `available_at, created_at, id`；另用持久 `worker_claim_state.next_kind` 对三种 work kind 轮转保留候选槽，避免持续 submission 或 webhook 流量让其他 kind 永久饥饿。Webhook 5 分钟 start SLO 以 priority 300 的专门负载测试验证，aging 不能把安全撤权工作降级。

队列键和并发规则固定为：

- Webhook repository job：`webhook:{delivery_guid}:{repository_id}`；delivery 自身仍只用 GUID 去重。若事件合并进该 repository 已有 active job，递增 generation、以 delivery GUID 为 `source_key` 写 trigger ledger 并写 delivery-job junction，不再创建第二个 job。
- Webhook recovery：`recovery:{app_id}:{window_lower_bound}:{window_upper_bound}`；分页 continuation 只写同一 job 的 `page_cursor`，不能每页另造绕过 quota 的任务。
- Schedule：`schedule:{repository_id}:{UTC 日期或配置时间窗}`。
- Submission：`submission:{submission_id}:{validation_epoch}`；用户补充资料或 Admin 显式 retry 都先递增 epoch，因此不会撞到旧 dead/succeeded job 的永久 dedupe key。
- Catalog validation：`catalog-validation:{catalog_validation_request_id}:{validation_epoch}`；import/draft retry 递增 epoch并清旧 evidence。
- Manual：`manual:{request_id}`。
- 对同一 repository 建 `status IN (queued, leased, retry)` 的 active partial unique index；新触发撞到活动任务时，在事务中合并为新 generation/trigger ledger 行，而不是丢事件或并行抓取。
- 默认 lease TTL 为 5 分钟，显著大于 90 秒 attempt budget；每处理完一个 part 可续租，过期租约可回收。续租、成功和失败提交都必须以 `work_kind + work_id + lease_owner` compare-and-swap，旧 worker 不能完成已被接管的任务。
- 每次 attempt 建一条带 `job_id` 的 `github_sync_runs`，形成 job → runs 审计链。永久 unique dedupe key 只用于上述带 delivery/request/time-window 的事件身份，不会阻止下一日调度。

Manual trigger 的 schema-validated `github_sync_job_triggers.payload` 必须保存 Admin command request ID、actor profile ID、请求时角色和 reason；job `payload` 仍只保存执行/checkpoint 数据。仓库级手动同步由 trigger/job/run 审计，不塞进只面向 submission/resource 的 `review_events`。

合并不能吞掉已 leased 任务之后到达的新事件：每次合并原子递增 `generation`、抬升 priority并写入 trigger ledger；新加入的 submission/catalog association 保存该次 `required_generation`。worker 领取时写入 `leased_generation`，完成必须校验 owner 与该 leased generation，但不要求它仍等于已可能增长的 job `generation`。若租约期间 generation 增长，当前结果可作为一次 run 留档，成功事务只消费 `generation <= leased_generation` 的 ledger 行，job 按剩余未消费 trigger 重算 priority并原子回到 `queued`。Webhook delivery/submission/catalog request 自身的唯一记录保留每个触发身份，ledger 则给 schedule/manual/安全 trigger 提供同等可计算的消费记录。

普通 sync attempt 成功发布 snapshot 时，在同一完成事务只读取 active 且 generation/epoch 匹配的 submission/catalog associations。对每个精确 target只做 append-only/idempotent validation-result INSERT；随后把 result ID 与 epoch绑定到仍匹配的业务目标。Submission 的 valid result 在 canonical lock 内仲裁后进入 `review/duplicate`，needs-input result 保持 provisional并进入 `needs_input`；catalog request 进入 `valid/needs_input`。关联随后标为 `completed`，identity/epoch 已变化的标为 `detached`，晚到 generation 留给下一 attempt。Job 耗尽 attempts 时，reconciler 也只处理仍匹配的 active association，改业务目标为 `validation_failed` 并写相应审计。Admin retry、revalidate 或 identity PATCH 先递增 epoch、清 current evidence并完成/detach 旧 association，因此旧 dead job不能回写。Schedule/webhook/manual job 没有业务 target association 时不触碰 submission/catalog 状态。

系统架构触发的 duplicate promotion 必须调用同一个 `attach_submission_validation_work(submission_id, expected_epoch)`。Canonical duplicate 由数据库约束保证已有与 winner 一致的 `resolved_repository_id`，因此函数只允许合并 sync job、递增 generation并写 active sync association；若 identity 缺失则事务失败并告警，禁止退回 resolution 后破坏整组 canonical key。该函数与 canonical-lock promotion 同事务，任一关联写入失败则状态仍保持 duplicate，不能先改为 `received` 再异步补任务。

## 11. Auth context 与 Token 生命周期

GitHub App installation Token 按任务即时签发并只在内存使用，不写数据库。同步器根据 `github_installation_repositories` 选择授权上下文；未安装 App 的公共仓库只能使用独立的 anonymous context，不能借用其他 installation Token。Webhook delivery list/redelivery 使用短期 App JWT 和独立 `app:{app_id}` bucket，只能由 recovery work 调用，不能拿 App JWT 抓 repository contents，也不能把 App 与 installation/anonymous quota 混算。

## 12. Access revocation 与 read gate

“继续服务最后好快照”只适用于临时网络错误、速率限制或非敏感 endpoint 失败。仓库私有化、删除、App installation 删除/暂停、仓库从 installation 移除，或仓库 metadata/身份请求出现 403/404 而造成访问状态不确定时，必须立即把 `access_state` 改为不可公开并隐藏全部缓存内容，再异步匿名确认公开状态。数据库 CHECK 已禁止 `access_state = accessible` 与非 public visibility 共存；所有详情、artifact 和正文 view 还必须固定使用 `visibility = 'public' AND access_state = 'accessible'` 双条件，任何单列条件或应用层事后过滤都不合格。恢复 installation 授权只决定抓取凭据，不能让 private/internal 仓库公开。

访问状态迁移固定如下：

- 已确认 public 且至少一个有效抓取上下文可用时为 `accessible`，并清空 `access_invalidated_at`。
- installation removed/suspended/deleted 时，先在同一事务检查该 repository 是否仍有其他 active installation 授权；没有时立即 fail closed，写 `revoked/suspended` 和首次 `access_invalidated_at`，再排队匿名 metadata 确认。
- 匿名确认仍为 public 时恢复 `accessible`；确认 private/deleted 时写相应终态并立即清正文。确认请求临时失败时写 `access_uncertain`，但保留最初 invalidated 时间，不能每次失败重新计时。
- 任一非 accessible 状态自 `access_invalidated_at` 满 24 小时仍未恢复时，清理正文与已登记派生缓存；read gate 从状态失效的第一刻就拒绝公开，不等待清理完成。

第一版派生层边界固定如下：不做详情预渲染；禁用远程 README 图片且不设图片代理；GitHub 正文/artifact 响应使用 `Cache-Control: no-store`，不进入 CDN；搜索只索引人工目录投影，不索引 GitHub 正文。公开目录和评分 aggregate 可以缓存，但必须登记 cache key、TTL、owner 和 purge 接口。以后增加任何搜索、渲染、图片或 CDN 派生层前，必须先加入这份派生层登记并实现可测试的失效入口。

确认私有/删除时立即清理 `raw_text_ciphertext`、`sanitized_text`、正文型 `parsed_json` 和由它们实际产生的已登记缓存；`access_uncertain` 持续 24 小时仍无法确认时也按不可访问处理。读取路径仍必须先检查 `access_state`，不能把异步删除当作唯一保护。只保留 node ID、状态、时间和摘要哈希等最小审计元数据。单个允许列表文件或 latest release 的 404 按 `absent` 处理，不等同仓库不可访问。

## 13. Retention 与 GC

`repositories`、`github_installations` 和 `github_apps` 是 provider identity/授权历史根：仓库删除使用 `repositories.access_state = deleted`，installation 删除使用 `status = deleted`，App 退役使用 `status = disabled`；正常运行和访问撤销流程都不物理删除这三类根行。它们的直接业务/审计外键统一使用 `RESTRICT`；`CASCADE` 只用于 snapshot 下的 part 等可随唯一父实体共同删除的非独立 leaf。若未来法规要求物理删除 identity 根，必须使用专用 purge 计划，先证明已清空 retention closure 与所有 RESTRICT 子行，不依赖外键级联触发顺序。

正常可访问仓库的保留策略固定为：保留 latest snapshot、最近 30 天内的 snapshot、最近 10 个成功 snapshot、活动 submission/catalog request 的 current validation result、仍在保留期内 `accepted` review event 或 `published` catalog event 引用的发布证据，以及这些结果/快照直接引用的 terminal present 来源；其他 snapshot/artifact 可清理。无 FK root 的 validation result 至少保留到 `validated_at + 6 hours`，使 validation-reuse 窗口真实可用。其他事件不持有 snapshot FK，只保留 head/summary hash。Current/result/event FK 先固定 validation result，再由其 composite snapshot/repository FK固定正确 snapshot；被任何保留 snapshot 引用的 run 与 job一并进入 retention closure，即使超过 90 天。未被引用的 run/job 状态与摘要默认保留 90 天，完整错误正文和失败 artifact 最多保留 30 天。清理顺序为过期且未引用 validation result → artifact/snapshot → run → completed/detached junction、已对账 reservation 与 trigger ledger → job，并让 `RESTRICT` 外键兜底。访问撤销清理优先于正常保留期，但仍保留最小审计元数据。

Resolution job/attempt、recovery job/attempt、submission/catalog 两类 sync junction 与两类 resolution junction 默认保留 90 天。只有 `association_state = active` 才阻止 junction/job 清理；`completed/detached` 到期后可以删除，业务目标的 current evidence、用户可见状态和 review/catalog event 是其长期记录。Webhook delivery、redelivery request 和 delivery-job junction 默认保留 90 天；先删已终态的 redelivery/junction，再删除未进入 snapshot retention closure 的 job 与 delivery。Reconciled/expired quota reservation 随对应 work 的 retention closure 删除。

`github_worker_invocations` 明细保留 30 天，关键计数和延迟先聚合到监控时序后再分批删除；不得让每分钟唤醒记录无限增长。`github_http_cache` 保留每个 endpoint/auth context 的当前活动 representation，以及被保留 snapshot 通过 `last_used_snapshot_id` 引用的项；其他超过 30 天未检查/未引用的 ref/query cache 删除。GC 每日按小批执行并记录删除数量、最老时间与失败原因。

每月记录 snapshot 数、artifact 压缩前后字节、source closure 大小并断言复用链深度 ≤ 1。首版容量测试使用实际 2,000 个资源的文件数量/大小分布估算存储，而不是只按资源行数估算。
