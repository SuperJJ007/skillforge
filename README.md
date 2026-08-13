# SkillForge

面向科研场景的 Skill、MCP 和 Plugin 发现与评估目录。

当前仓库是 React + Vite 前端基线。首页已经按“适用范围 / 学科领域”统一筛选资源；11 条旧数据只作为待来源核验的迁移候选，经 `LocalResourceRepository` 裁剪后展示。真实账号、提交、社区评分、GitHub 同步和 Admin 审核尚未接入后端。

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

- [系统架构：评分、GitHub 同步与资源详情](docs/architecture.md)
- [文档索引](docs/README.md)

## 当前边界

- `src/data.js` 是隔离的旧原型 fixture，只有 `src/repositories/LocalResourceRepository.js` 可以读取；页面和组件不得直接导入。
- 本地适配器只暴露候选条目的标题、简介、类型、署名、标签和分类；静态 `rating`、下载量、Stars、安装命令、兼容性、安全结论、Bench 与论文引用不会进入页面。
- 登录、提交和 Admin 审核显示明确“尚未开放”；Planner、Bench 和旧学科页显示明确“已退役”，不会模拟成功或计算结果。
- 首页、候选详情和署名页通过 `catalogService` 读取同一 repository；以后接入 HTTP API 时替换 repository，不让页面重新依赖 fixture。
