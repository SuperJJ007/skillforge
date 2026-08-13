# SkillForge 产品权威

> 状态：产品基线，实施待办<br>
> 更新日期：2026-08-13<br>
> 范围：产品边界、数据所有权、已确定与待确认的产品决策<br>
> 命名：仓库名为 `skillforge`，当前界面品牌文字为 “SciForge”；本文统一称 SkillForge，最终品牌名另行确认。

本文是上述范围的唯一权威。系统实现、接口合同和临时计划不得复制或改写其中的决策；需要引用时链接到本文件。

## 1. 产品边界

### 1.1 要解决的问题

1. 用户能按适用范围或学科查找 Skill、MCP、Plugin。
2. 详情页能明确回答：它是什么、怎么安装、需要什么环境和权限、仓库是否仍在维护、信息何时同步。
3. 登录用户能给资源打 1–5 星，可以修改或清除，不做评论。
4. GitHub 信息可以自动更新，但不能覆盖 SkillForge 的人工分类、编辑说明、安全结论或 Bench 证据。
5. 每个事实都能说明来源；缺数据时显示“未知”或“未验证”，不能生成看似真实的默认值。

### 1.2 明确不做

- 不做评论、短评、点赞、关注动态和公开评分用户列表。
- 不把 GitHub Stars 当作社区评分。
- 不把 Bench 分数画成社区五星。
- 不根据 GitHub Stars、Forks 或 Release 推测安装人数。
- 不抓取或执行仓库代码，不自动运行 README 中的命令。
- 不抓 `.env`、Token、私有文件、Issue 评论、PR 评论或完整仓库历史。
- 不为当前规模拆分评分服务、目录服务和 GitHub 服务。

## 2. 数据所有权与可信边界

详情页会组合四类数据，但四类数据必须分开保存。

| 数据域 | 示例 | 唯一写入方 | 能否被 GitHub 覆盖 |
| --- | --- | --- | --- |
| 人工目录数据 | 标题、中文简介、类型、适用范围、学科、审核状态 | SkillForge 编辑/审核流程 | 否 |
| GitHub 快照 | Stars、Forks、协议、README、Release、最近推送 | GitHub 同步任务 | 仅覆盖同一 GitHub 数据域 |
| 社区评分 | 平均分、人数、用户自己的评分 | 登录用户经 Rating API | 否 |
| Bench / 学术证据 | 测试版本、分数、方法、DOI、引用 | 独立评测或证据流程 | 否 |

API 返回时也保持这些命名空间，不把它们压成一组来源不明的字段：

```json
{
  "resource": {},
  "classification": {},
  "communityRating": {},
  "github": {},
  "benchmark": null,
  "viewer": {}
}
```

所有自动抓取或计算结果至少保存：

- `source`
- `source_url`（适用时）
- `fetched_at` 或 `computed_at`
- `source_revision`（commit SHA、release tag 或 benchmark version）
- `parser_version`（结构化解析时）

## 3. 已确定与待确认

已确定的产品方向：

- 首页核心对象是 Skill、MCP、Plugin。
- “通用科研”与学科分开，选中后统一过滤三个资源分区。
- 视觉延续当前简洁卡片风格；首页大标题暂定第 5 套“港湾”配色：`#C5D9ED` × `#EFC5B5`。
- 社区评分使用 1–5 星，不做评论。
- GitHub Stars、社区评分和 Bench 分数严格分开。
- 详情页展示缓存的、带来源的数据，不展示编造默认值。
- 第一版 API、认证与 Worker 固定使用 Supabase Auth + Edge Functions：前端以 Bearer access JWT 调用，Cron 通过 `pg_cron + pg_net` 唤醒同步 Worker。
- 中文目录搜索固定使用 PGroonga，并且只索引人工目录投影。
- 已安装仓库采用 Webhook + 每日兜底；未安装仓库按匿名预算做 7–30 天分层同步。
- 第一版不做详情预渲染、README 图片代理或 GitHub 正文 CDN 缓存。
- 当前维护者禁止给自己的资源评分；第一版不收录私有仓库。

仍需确认的产品命名只有：

- 最终对外品牌使用 SkillForge 还是 SciForge。

作者认领、私有仓库、图片代理和更高频未安装仓库同步都属于后续能力，启用时必须新增数据、安全与配额合同；它们不阻塞第一版实施。
