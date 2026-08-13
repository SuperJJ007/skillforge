# SkillForge

面向科研场景的 Skill、MCP 和 Plugin 发现与评估目录。

当前仓库是 React + Vite 前端基线。首页以“全部 / 通用 / 学科”统一筛选资源；目录包含 11 条待来源核验的旧迁移候选，以及 40 条带固定仓库 revision 来源快照的候选，统一经 `LocalResourceRepository` 裁剪后展示。真实账号、提交、社区评分、自动 GitHub 同步和 Admin 审核尚未接入后端。

## 本地运行

```bash
npm install
npm run dev
```

常用检查：

```bash
npm run lint
npm run check:truth
npm run build
```

## 文档

- [文档索引](docs/README.md)
- [产品权威：范围、数据所有权与产品决策](docs/authority/product.md)
- [系统架构：数据模型、实现顺序与验收](docs/architecture/system.md)
- [代码接口目录](docs/interfaces/README.md)

## 当前边界

- `src/data.js` 是隔离的旧原型 fixture，只有 `src/repositories/LocalResourceRepository.js` 可以读取；页面和组件不得直接导入。
- `src/domain/catalogIdentity.js` 冻结 51 条资源和 21 个署名的独立 UUID/slug（11 条旧迁移候选、40 条来源已定位候选），并作为 13 学科与逐资源分类的唯一本地来源。
- 旧学科 URL 只通过 `LegacyTaxonomyAdapter` 进入版本化迁移；旧资源和作者 slug 保持为 canonical URL，Planner 与 Bench 保持 retired route。
- 旧 fixture 只暴露候选条目的标题、简介、类型、署名、标签和分类；其中的静态 `rating`、下载量、Stars、安装命令、兼容性、安全结论、Bench 与论文引用不会进入页面。
- 来源已定位候选可展示固定 commit 中的项目能力、官方安装入口、运行前提、许可证和注意事项；每项都绑定来源 URL，且保持“项目自述、SkillForge 未运行验证”的证据状态。
- 登录、提交和 Admin 审核显示明确“尚未开放”；Planner、Bench 和旧学科页显示明确“已退役”，不会模拟成功或计算结果。
- 首页、候选详情和署名页通过 `catalogService` 读取同一 repository；以后接入 HTTP API 时替换 repository，不让页面重新依赖 fixture。
