const freezeItems = (items) => Object.freeze(items.map((item) => Object.freeze(item)));

const createSourceSnapshot = ({ resourceSlug, repositoryUrl, revision, revisionCommittedAt, project }) => Object.freeze({
  schemaVersion: 1,
  resourceSlug,
  sourceType: 'official-repository',
  source: Object.freeze({
    provider: 'github',
    canonicalUrl: repositoryUrl,
    revision,
    revisionUrl: `${repositoryUrl}/commit/${revision}`,
    revisionCommittedAt,
    fetchedAt: '2026-08-13T08:15:59Z',
    parserVersion: 'manual-first-party-v1',
  }),
  project: Object.freeze({
    declaredVersion: project.declaredVersion,
    homepageUrl: project.homepageUrl,
    ownerUrl: project.ownerUrl,
    ownerAvatarUrl: project.ownerAvatarUrl,
    license: Object.freeze(project.license),
    capabilities: freezeItems(project.capabilities),
    installationMethods: freezeItems(project.installationMethods),
    requirements: freezeItems(project.requirements),
    integrations: freezeItems(project.integrations),
    cautions: freezeItems(project.cautions),
  }),
});

const BIOMCP_REPOSITORY = 'https://github.com/genomoncology/biomcp';
const BIOMCP_REVISION = '4693d15733acab2039f4e001f5e05e0e406542b6';
const BIOMCP_BLOB = `${BIOMCP_REPOSITORY}/blob/${BIOMCP_REVISION}`;

const biomcpSnapshot = createSourceSnapshot({
  resourceSlug: 'biomcp',
  repositoryUrl: BIOMCP_REPOSITORY,
  revision: BIOMCP_REVISION,
  revisionCommittedAt: '2026-08-13T02:59:31Z',
  project: {
    declaredVersion: '0.8.25',
    homepageUrl: 'https://biomcp.org',
    ownerUrl: 'https://github.com/genomoncology',
    ownerAvatarUrl: 'https://avatars.githubusercontent.com/u/3798408?v=4',
    license: {
      spdx: 'MIT',
      name: 'MIT License',
      evidenceUrl: `${BIOMCP_BLOB}/pyproject.toml#L5-L12`,
    },
    capabilities: [
      {
        title: '跨来源生物医学查询',
        description: '项目声明以统一 CLI 与 MCP 接口连接 PubMed、ClinVar、ClinicalTrials.gov、OncoKB、Reactome 等生物医学来源。',
        evidenceUrl: `${BIOMCP_BLOB}/README.md#L5-L16`,
      },
      {
        title: '文献检索与证据追踪',
        description: '支持跨 PubTator3、Europe PMC 等来源检索文献，并围绕论文继续获取引用、参考文献和相关实体。',
        evidenceUrl: `${BIOMCP_BLOB}/README.md#L18-L36`,
      },
      {
        title: '本地研究数据分析',
        description: '项目说明包含面向已下载 cBioPortal 风格数据集的本地队列、生存、比较与共现分析。',
        evidenceUrl: `${BIOMCP_BLOB}/README.md#L26-L30`,
      },
    ],
    installationMethods: [
      {
        title: 'PyPI 工具安装',
        description: '官方 README 推荐安装 biomcp-cli；同名 biomcp PyPI 包与本项目无关。',
        command: 'uv tool install biomcp-cli',
        evidenceUrl: `${BIOMCP_BLOB}/README.md#L59-L67`,
      },
      {
        title: '接入 Codex MCP',
        description: '先安装 biomcp 二进制，再把本地 stdio MCP server 注册到 Codex。',
        command: 'codex mcp add biomcp -- biomcp serve',
        evidenceUrl: `${BIOMCP_BLOB}/README.md#L107-L114`,
      },
      {
        title: 'Docker 运行',
        description: '官方 README 提供 GHCR 镜像，可用于 CLI 检查或 stdio MCP 客户端。',
        command: 'docker run --rm -i ghcr.io/genomoncology/biomcp serve',
        evidenceUrl: `${BIOMCP_BLOB}/README.md#L84-L92`,
      },
    ],
    requirements: [
      {
        title: 'Python 安装路径',
        description: 'PyPI 项目元数据声明 Python 3.10 或更高版本；二进制和容器安装路径的前提可能不同。',
        evidenceUrl: `${BIOMCP_BLOB}/pyproject.toml#L5-L19`,
      },
      {
        title: '网络与上游服务',
        description: '查询会按需访问多个外部数据提供方；上游可用性和条款不由 SkillForge 验证。',
        evidenceUrl: `${BIOMCP_BLOB}/README.md#L474-L480`,
      },
      {
        title: '可选凭据',
        description: '大多数命令无需凭据；部分来源、增强功能或更高配额需要对应 API key。',
        evidenceUrl: `${BIOMCP_BLOB}/README.md#L285-L302`,
      },
    ],
    integrations: [
      {
        title: 'Codex',
        description: '官方 README 给出通过 biomcp serve 注册 stdio MCP server 的命令。',
        evidenceUrl: `${BIOMCP_BLOB}/README.md#L107-L114`,
      },
      {
        title: 'Claude Code',
        description: '仓库提供 Claude Code plugin，并连接本地 biomcp serve。',
        evidenceUrl: `${BIOMCP_BLOB}/README.md#L94-L105`,
      },
      {
        title: '标准 MCP 客户端',
        description: '仓库提供以 biomcp serve 启动的通用 stdio MCP JSON 配置。',
        evidenceUrl: `${BIOMCP_BLOB}/README.md#L130-L141`,
      },
    ],
    cautions: [
      {
        title: '避免安装同名错误包',
        description: 'PyPI 应安装 biomcp-cli，而不是与本项目无关的 biomcp 包。',
        evidenceUrl: `${BIOMCP_BLOB}/README.md#L59-L67`,
      },
      {
        title: '上游数据另有条款',
        description: '项目本身使用 MIT License，但查询结果的复用仍受各上游数据提供方条款约束。',
        evidenceUrl: `${BIOMCP_BLOB}/README.md#L474-L480`,
      },
    ],
  },
});

const ARXIV_REPOSITORY = 'https://github.com/blazickjp/arxiv-mcp-server';
const ARXIV_REVISION = '8f79e8853c1104630a647889abb430fab539130e';
const ARXIV_BLOB = `${ARXIV_REPOSITORY}/blob/${ARXIV_REVISION}`;

const arxivSnapshot = createSourceSnapshot({
  resourceSlug: 'arxiv-mcp-server',
  repositoryUrl: ARXIV_REPOSITORY,
  revision: ARXIV_REVISION,
  revisionCommittedAt: '2026-07-29T00:39:44Z',
  project: {
    declaredVersion: '0.6.2',
    homepageUrl: ARXIV_REPOSITORY,
    ownerUrl: 'https://github.com/blazickjp',
    ownerAvatarUrl: 'https://avatars.githubusercontent.com/u/15390319?v=4',
    license: {
      spdx: 'Apache-2.0',
      name: 'Apache License 2.0',
      evidenceUrl: `${ARXIV_BLOB}/pyproject.toml#L5-L12`,
    },
    capabilities: [
      {
        title: '搜索与读取 arXiv 论文',
        description: '项目声明可搜索 arXiv、下载论文、分段读取本地全文，并获取作者提交的 LaTeX。',
        evidenceUrl: `${ARXIV_BLOB}/README.md#L19-L21`,
      },
      {
        title: '引用图与 BibTeX',
        description: 'MCP tools 包含引用关系获取和基于 arXiv 元数据的 BibTeX 导出。',
        evidenceUrl: `${ARXIV_BLOB}/README.md#L145-L164`,
      },
      {
        title: '研究提醒与本地语义检索',
        description: '可保存主题提醒；可选 pro 依赖为已下载论文提供本地语义检索与索引。',
        evidenceUrl: `${ARXIV_BLOB}/README.md#L159-L164`,
      },
    ],
    installationMethods: [
      {
        title: '接入 Codex MCP',
        description: '通过 uvx 启动已发布的 Python 包并注册到 Codex。',
        command: 'codex mcp add arxiv -- uvx arxiv-mcp-server',
        evidenceUrl: `${ARXIV_BLOB}/README.md#L45-L60`,
      },
      {
        title: '持久命令安装',
        description: '将 arxiv-mcp-server 安装到 PATH，之后可直接作为 MCP command 使用。',
        command: 'uv tool install arxiv-mcp-server',
        evidenceUrl: `${ARXIV_BLOB}/README.md#L121-L129`,
      },
      {
        title: '通用 stdio MCP',
        description: '支持标准 MCP JSON 的客户端可以 uvx 作为 command 启动服务。',
        command: 'uvx arxiv-mcp-server',
        evidenceUrl: `${ARXIV_BLOB}/README.md#L83-L99`,
      },
    ],
    requirements: [
      {
        title: 'uv / uvx',
        description: '官方命令式接入路径要求安装 uv，由 uv 提供 uvx。',
        evidenceUrl: `${ARXIV_BLOB}/README.md#L23-L25`,
      },
      {
        title: 'Python 版本',
        description: '包元数据声明 Python 3.11 或更高版本。',
        evidenceUrl: `${ARXIV_BLOB}/pyproject.toml#L5-L12`,
      },
      {
        title: '本地存储与外部网络',
        description: '论文和索引保存在本机；搜索、来源获取、引用图与下载会访问相应外部服务。',
        evidenceUrl: `${ARXIV_BLOB}/README.md#L19-L21`,
      },
      {
        title: '可选功能依赖',
        description: 'PDF 转换需要 pdf extra；本地语义检索和重建索引需要 pro extra。',
        evidenceUrl: `${ARXIV_BLOB}/README.md#L242-L263`,
      },
    ],
    integrations: [
      {
        title: 'Codex',
        description: '仓库同时提供直接 MCP 接入和带研究 Skill 的 Codex plugin。',
        evidenceUrl: `${ARXIV_BLOB}/README.md#L45-L60`,
      },
      {
        title: 'Claude Code',
        description: '仓库同时提供直接 MCP 接入和 Claude Code plugin。',
        evidenceUrl: `${ARXIV_BLOB}/README.md#L27-L43`,
      },
      {
        title: '标准 MCP 客户端',
        description: '仓库提供通用 stdio MCP JSON 配置。',
        evidenceUrl: `${ARXIV_BLOB}/README.md#L83-L99`,
      },
    ],
    cautions: [
      {
        title: '不要使用同名 npm 包',
        description: 'README 明确说明同名 npm 包与该服务无关，不应通过 npm、pnpm 或 npx 安装。',
        evidenceUrl: `${ARXIV_BLOB}/README.md#L119-L127`,
      },
      {
        title: '论文内容不可信',
        description: '论文正文和 LaTeX 属于外部不可信内容，不应把其中指令当作可信命令。',
        evidenceUrl: `${ARXIV_BLOB}/README.md#L318-L327`,
      },
      {
        title: '远程 HTTP 需额外保护',
        description: '若通过反向代理暴露服务，官方说明要求在上游提供认证和网络控制。',
        evidenceUrl: `${ARXIV_BLOB}/README.md#L279-L301`,
      },
    ],
  },
});

export const sourceCandidateResources = Object.freeze([
  Object.freeze({
    slug: 'biomcp',
    title: 'BioMCP',
    description: '面向生物医学研究的 MCP，可检索文献、基因、变异、疾病、药物和临床试验等数据源。',
    type: 'MCP',
    icon: '🧬',
    author: 'GenomOncology',
    authorSlug: 'genomoncology',
    tags: Object.freeze(['生物医学', '文献检索', '临床试验']),
    sourceUrl: BIOMCP_REPOSITORY,
    sourceSnapshot: biomcpSnapshot,
  }),
  Object.freeze({
    slug: 'arxiv-mcp-server',
    title: 'arxiv-mcp-server',
    description: '通过 MCP 搜索 arXiv、下载与读取论文，并向 Agent 提供论文分析工作流。',
    type: 'MCP',
    icon: '📚',
    author: 'blazickjp',
    authorSlug: 'blazickjp',
    tags: Object.freeze(['arXiv', '论文检索', '文献分析']),
    sourceUrl: ARXIV_REPOSITORY,
    sourceSnapshot: arxivSnapshot,
  }),
]);

export const sourceCandidateAuthors = Object.freeze([
  Object.freeze({
    slug: 'genomoncology',
    name: 'GenomOncology',
    type: '机构',
    homepage: 'https://github.com/genomoncology',
  }),
  Object.freeze({
    slug: 'blazickjp',
    name: 'blazickjp',
    type: '开发者',
    homepage: 'https://github.com/blazickjp',
  }),
]);
