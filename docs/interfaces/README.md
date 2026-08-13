# SkillForge 代码接口

本目录只记录已实现的跨模块、跨进程或对外合同。产品决策链接到 [产品权威](../authority/product.md)，未实现的目标设计链接到 [系统架构](../architecture/system.md)，不在此复制。

当前已实现的进程内边界：

- Catalog identity：[`src/domain/catalogIdentity.js`](../../src/domain/catalogIdentity.js)，冻结资源/作者 UUID 与 slug，并统一供应本地 taxonomy 和逐资源分类。
- Catalog domain：[`src/domain/catalog.js`](../../src/domain/catalog.js)，定义分类不变量与本地筛选/搜索语义。
- Source snapshot：[`schemas/catalog-source-snapshot.v1.schema.json`](../../schemas/catalog-source-snapshot.v1.schema.json) 定义人工采集器或后续爬虫的闭合 v1 输出；[`src/domain/sourceSnapshot.js`](../../src/domain/sourceSnapshot.js) 负责当前运行时的身份、revision 与证据 URL 不变量。
- Local repository：[`src/repositories/LocalResourceRepository.js`](../../src/repositories/LocalResourceRepository.js)，是旧 fixture 与本地来源快照的唯一读取边界。
- Legacy taxonomy：[`src/repositories/LegacyTaxonomyAdapter.js`](../../src/repositories/LegacyTaxonomyAdapter.js)，只管理版本化旧学科迁移、资源/作者路径保留和 retired route 合同，不供应退役页内容。
- Catalog service：[`src/services/catalogService.js`](../../src/services/catalogService.js)，是当前页面调用的目录入口。

它们是当前代码事实，但尚未声明为可独立发布的稳定合同。当前没有已实现的 HTTP API、事件或数据库接口；[系统架构中的 API](../architecture/system.md#7-api-合同) 仍是待实现设计。

来源快照只拥有项目自述事实与采集元数据；目录标题、中文简介、类型、分类、审核和发布状态仍属于人工目录数据。`source-documented` 不能被解释为已安装、已兼容、已安全审计或已由 SkillForge 运行验证。

新增合同前，先确认它不是一次性计划或架构设计的重复内容，再将入口补到 [文档索引](../README.md)。
