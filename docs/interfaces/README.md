# SkillForge 代码接口

本目录只记录已实现的跨模块、跨进程或对外合同。产品决策链接到 [产品权威](../authority/product.md)，未实现的目标设计链接到 [系统架构](../architecture/system.md)，不在此复制。

当前已实现的进程内边界：

- Catalog domain：[`src/domain/catalog.js`](../../src/domain/catalog.js)，定义分类不变量与本地筛选/搜索语义。
- Local repository：[`src/repositories/LocalResourceRepository.js`](../../src/repositories/LocalResourceRepository.js)，是旧 fixture 的唯一读取边界。
- Catalog service：[`src/services/catalogService.js`](../../src/services/catalogService.js)，是当前页面调用的目录入口。

它们是当前代码事实，但尚未声明为可独立发布的稳定合同。当前没有已实现的 HTTP API、事件或数据库接口；[系统架构中的 API](../architecture/system.md#7-api-合同) 仍是待实现设计。

新增合同前，先确认它不是一次性计划或架构设计的重复内容，再将入口补到 [文档索引](../README.md)。
