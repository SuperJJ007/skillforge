import {
  createSourceAuthor,
  createSourceCandidate,
  installationFact,
  sourceFact,
} from './sourceCandidateFactory.js';

const FETCHED_AT = '2026-08-13T09:05:00Z';
const REPOSITORY = 'https://github.com/anthropics/life-sciences';
const REVISION = 'e96556b637b56d6cc3a5ad33987009be9e60aa5c';
const COMMITTED_AT = '2026-05-08T16:54:54Z';
const BLOB = `${REPOSITORY}/blob/${REVISION}`;
const README_EVIDENCE = `${BLOB}/README.md#L9-L36`;
const MARKETPLACE_EVIDENCE = `${BLOB}/.claude-plugin/marketplace.json#L1-L220`;
const OWNER = {
  ownerUrl: 'https://github.com/anthropics',
  ownerAvatarUrl: 'https://avatars.githubusercontent.com/u/76263028?v=4',
};

const makeSkill = ({
  slug,
  title,
  root,
  description,
  icon,
  tags,
  capabilities,
  requirement,
  caution,
}) => {
  const skillEvidence = `${BLOB}/${root}/SKILL.md#L1-L152`;
  return createSourceCandidate({
    slug,
    title,
    description,
    type: 'Skill',
    icon,
    author: 'Anthropic',
    authorSlug: 'anthropics',
    tags,
    repositoryUrl: REPOSITORY,
    revision: REVISION,
    revisionCommittedAt: COMMITTED_AT,
    fetchedAt: FETCHED_AT,
    rootPath: root,
    manifestPath: `${root}/SKILL.md`,
    project: {
      ...OWNER,
      license: {
        spdx: 'Apache-2.0',
        name: 'Apache License 2.0',
        evidenceUrl: `${BLOB}/${root}/LICENSE.txt#L1-L3`,
      },
      capabilities: capabilities.map(([factTitle, factDescription]) => (
        sourceFact(factTitle, factDescription, skillEvidence)
      )),
      installationMethods: [
        installationFact(
          'Claude Code marketplace',
          '从 Anthropic 官方 life-sciences marketplace 安装该 Skill。',
          `/plugin install ${root === 'clinical-trial-protocol-skill' ? 'clinical-trial-protocol' : root}@life-sciences`,
          README_EVIDENCE,
        ),
      ],
      requirements: [sourceFact('运行前提', requirement, skillEvidence)],
      integrations: [
        sourceFact('Claude Code Skill', '该资源由 Anthropic life-sciences marketplace 以 Skill 形式提供。', MARKETPLACE_EVIDENCE),
      ],
      cautions: [sourceFact('使用边界', caution, skillEvidence)],
    },
  });
};

const skillCandidates = [
  makeSkill({
    slug: 'anthropic-single-cell-rna-qc',
    title: 'Single-Cell RNA-seq Quality Control',
    root: 'single-cell-rna-qc',
    description: '按照 scverse 实践完成单细胞 RNA-seq 质控、过滤、可视化与 AnnData 输出。',
    icon: '🧫',
    tags: ['单细胞', 'RNA-seq', '质量控制'],
    capabilities: [
      ['读取与标注单细胞数据', '读取 .h5ad 或 10x .h5，计算细胞和基因层面的 QC 指标。'],
      ['过滤与前后对照', '支持 MAD 过滤、基因过滤和过滤前后可视化，并输出 annotated/filtered AnnData。'],
    ],
    requirement: '需要 Python 及 anndata、scanpy、scipy、matplotlib、seaborn、numpy 等数据分析依赖。',
    caution: '质控阈值必须结合数据集与实验设计确定，不能把示例阈值当成普适标准。',
  }),
  makeSkill({
    slug: 'anthropic-scvi-tools',
    title: 'scvi-tools',
    root: 'scvi-tools',
    description: '面向单细胞与多组学数据的 scVI、scANVI、totalVI、PeakVI 和 MultiVI 工作流。',
    icon: '🧬',
    tags: ['单细胞', '多组学', '深度学习'],
    capabilities: [
      ['单细胞整合与标签转移', '覆盖 scVI/scANVI 的批次整合、表示学习、标签转移和差异表达流程。'],
      ['多模态组学模型', '覆盖 ATAC、CITE-seq、multiome、空间去卷积和 RNA velocity 等模型路径。'],
    ],
    requirement: '需要可用的 scvi-tools Python 环境；GPU、内存与依赖版本需按实际数据规模另行配置。',
    caution: '仓库提供工作流说明，不代表任一模型、硬件或训练结果已经由 SkillForge 验证。',
  }),
  makeSkill({
    slug: 'anthropic-nextflow-development',
    title: 'Nextflow Development',
    root: 'nextflow-development',
    description: '为 RNA-seq、WGS/WES 与 ATAC-seq 数据准备并运行 nf-core Nextflow 流程。',
    icon: '🔄',
    tags: ['Nextflow', 'nf-core', '测序分析'],
    capabilities: [
      ['流程与数据识别', '识别 GEO/SRA 或本地测序数据，并在 rnaseq、sarek 与 atacseq 流程间选择。'],
      ['运行准备与输出核验', '生成 samplesheet、检查环境、运行工作流并核验关键输出。'],
    ],
    requirement: '需要 Docker、Nextflow 与 Java，并要求环境检查通过；可使用本地 FASTQ 或公开 GEO/SRA 数据。',
    caution: '数据子集、参考基因组和流程参数需要研究者确认，不能由模板静默决定。',
  }),
  makeSkill({
    slug: 'anthropic-instrument-data-to-allotrope',
    title: 'Instrument Data to Allotrope',
    root: 'instrument-data-to-allotrope',
    description: '把 PDF、CSV、Excel 或文本格式的实验仪器数据转换为 ASM JSON 与扁平 CSV。',
    icon: '🧪',
    tags: ['实验数据', 'Allotrope', '数据标准化'],
    capabilities: [
      ['仪器数据识别与解析', '识别仪器类型并从常见实验文件格式中提取结构化字段。'],
      ['ASM 与 CSV 输出', '生成 Allotrope Simple Model JSON、扁平 CSV 和可复用解析器代码。'],
    ],
    requirement: '需要 allotropy、pandas、openpyxl 与 pdfplumber 等解析依赖。',
    caution: '上游将其标为 Example Skill；字段含义不清时应询问，不能猜测实验语义。',
  }),
  makeSkill({
    slug: 'anthropic-scientific-problem-selection',
    title: 'Scientific Problem Selection',
    root: 'scientific-problem-selection',
    description: '以结构化对话辅助科研选题、风险判断、优化目标和项目决策。',
    icon: '🧭',
    tags: ['科研选题', '研究策略', '决策框架'],
    capabilities: [
      ['选题与风险评估', '从项目创意、潜在影响、可行性和失败模式组织科研问题。'],
      ['决策树与卡点诊断', '用逆向思考、参数策略和决策树分析项目卡点。'],
    ],
    requirement: '仓库未声明额外运行依赖，主要通过对话和参考材料工作。',
    caution: '这是科研决策辅助框架，不是实验结果、基金成功率或项目可行性的验证工具。',
  }),
  makeSkill({
    slug: 'anthropic-clinical-trial-protocol',
    title: 'Clinical Trial Protocol Skill',
    root: 'clinical-trial-protocol-skill',
    description: '按阶段组织药物或器械临床试验方案、样本量计算与运营草案。',
    icon: '🏥',
    tags: ['临床试验', '方案设计', '样本量'],
    capabilities: [
      ['阶段化方案生成', '组织基础、介入和运营模块，并允许在 waypoint 之间恢复。'],
      ['研究与样本量支持', '结合相似试验和指引检索，使用 scipy/numpy 辅助样本量计算。'],
    ],
    requirement: 'Clinical Trials MCP 是必需依赖；样本量计算需要 Python、scipy 与 numpy。',
    caution: '输出应保持为供临床、统计和监管相关方审阅的草案，不能替代医学或合规判断。',
  }),
];

const makeMarketplaceMcp = ({
  id,
  title,
  description,
  icon,
  tags,
  requirement,
  caution,
  transport = '远程 HTTP MCP',
}) => {
  const manifestEvidence = `${BLOB}/${id}/.claude-plugin/plugin.json#L1-L15`;
  return createSourceCandidate({
    slug: `anthropic-${id}-mcp`,
    title,
    description,
    type: 'MCP',
    icon,
    author: 'Anthropic marketplace',
    authorSlug: 'anthropics',
    tags,
    repositoryUrl: REPOSITORY,
    revision: REVISION,
    revisionCommittedAt: COMMITTED_AT,
    fetchedAt: FETCHED_AT,
    rootPath: id,
    manifestPath: `${id}/.claude-plugin/plugin.json`,
    project: {
      ...OWNER,
      declaredVersion: '1.0.0',
      license: {
        spdx: 'NOASSERTION',
        name: '来源清单未声明许可证',
        evidenceUrl: manifestEvidence,
      },
      capabilities: [sourceFact('连接科研服务', description, manifestEvidence)],
      installationMethods: [
        installationFact(
          'Claude Code marketplace',
          '从 Anthropic 官方 life-sciences marketplace 安装该连接器。',
          `/plugin install ${id}@life-sciences`,
          README_EVIDENCE,
        ),
      ],
      requirements: [sourceFact('使用前提', requirement, manifestEvidence)],
      integrations: [sourceFact(transport, `资源清单声明该连接器以 ${transport} 方式提供。`, manifestEvidence)],
      cautions: [sourceFact('服务边界', caution, manifestEvidence)],
    },
  });
};

const mcpCandidates = [
  makeMarketplaceMcp({ id: 'pubmed', title: 'PubMed', description: '检索 PubMed 生物医学文献与研究文章。', icon: '📄', tags: ['PubMed', '生物医学', '文献检索'], requirement: '官方清单声明无需账户即可访问。', caution: '文献检索结果不构成医学建议，全文可得性仍取决于上游。' }),
  makeMarketplaceMcp({ id: 'biorxiv', title: 'bioRxiv / medRxiv', description: '访问 bioRxiv 与 medRxiv 的生物医学预印本数据。', icon: '📝', tags: ['预印本', 'bioRxiv', 'medRxiv'], requirement: '需要网络访问远程连接器；具体账户条件由服务提供方决定。', caution: '预印本尚未完成同行评审，不能按已确认研究结论使用。' }),
  makeMarketplaceMcp({ id: 'clinical-trials', title: 'Clinical Trials', description: '访问 ClinicalTrials.gov 的临床试验登记数据。', icon: '🏥', tags: ['临床试验', 'ClinicalTrials.gov', '医学'], requirement: '需要网络访问远程连接器。', caution: '登记信息可能更新或不完整，不能替代试验注册页和监管文件。' }),
  makeMarketplaceMcp({ id: 'chembl', title: 'ChEMBL', description: '访问 ChEMBL 的生物活性化合物、靶点结合与功能数据。', icon: '⚗️', tags: ['ChEMBL', '药物发现', '化学'], requirement: '需要网络访问远程连接器。', caution: '数据库记录与计算结果不能直接升级为药效、安全或临床结论。' }),
  makeMarketplaceMcp({ id: 'open-targets', title: 'Open Targets', description: '查询药物靶点发现、优先级和靶点—疾病关联数据。', icon: '🎯', tags: ['Open Targets', '药物靶点', '疾病关联'], requirement: '需要网络访问 Open Targets 远程连接器。', caution: '关联评分属于平台证据整合，不代表靶点已经获得实验或临床验证。' }),
  makeMarketplaceMcp({ id: 'consensus', title: 'Consensus', description: '跨学科搜索同行评审研究论文并获取证据综合。', icon: '🔎', tags: ['论文检索', '证据综合', '通用科研'], requirement: '需要 Consensus 账户及远程网络访问。', caution: '聚合与生成结果仍需回到原始论文核对。' }),
  makeMarketplaceMcp({ id: 'wiley-scholar-gateway', title: 'Wiley Scholar Gateway', description: '访问 Wiley Scholar Gateway 中的学术研究与出版物。', icon: '📚', tags: ['Wiley', '学术出版', '论文'], requirement: '需要 Scholar Gateway 账户。', caution: '正文访问和复用权利受出版物许可与账户权限约束。' }),
  makeMarketplaceMcp({ id: 'synapse', title: 'Synapse.org', description: '连接 Sage Bionetworks 的协作式研究数据管理平台。', icon: '🗂️', tags: ['研究数据', '协作', 'Synapse'], requirement: '需要 Synapse 账户及对应项目权限。', caution: '连接器权限取决于账户，不能假设可访问未授权或受控研究数据。' }),
  makeMarketplaceMcp({ id: 'biorender', title: 'BioRender', description: '创建并访问科研插图与科学图示。', icon: '🎨', tags: ['科研绘图', 'BioRender', '图示'], requirement: '需要 BioRender 账户。', caution: '素材、模板和导出结果仍受 BioRender 账户与许可条款约束。' }),
  makeMarketplaceMcp({ id: 'owkin', title: 'Owkin', description: '面向 H&E 病理切片查询、细胞定量、空间微环境与队列分析。', icon: '🔬', tags: ['数字病理', '肿瘤微环境', '队列分析'], requirement: '需要 Owkin 服务访问条件和相应研究数据。', caution: '病理与生存分析结果不能替代病理医师复核或临床决策。' }),
  makeMarketplaceMcp({ id: '10x-genomics', title: '10x Genomics Cloud', description: '访问 10x Genomics Cloud 的分析数据与工作流。', icon: '☁️', tags: ['10x Genomics', '单细胞', '云分析'], requirement: '需要 10x Genomics Cloud 账户、访问令牌和账户内分析数据。', caution: '清单引用外部 MCPB 包；本目录未验证二进制、账户范围或运行环境。', transport: '外部 MCPB 包' }),
  makeMarketplaceMcp({ id: 'tooluniverse', title: 'ToolUniverse', description: '连接用于科学发现和自动化的 AI scientist 工具集合。', icon: '🧰', tags: ['AI scientist', '科研工具', '自动化'], requirement: '需要外部 MCPB 包及其实际工具所要求的账户、依赖或凭据。', caution: '工具集合范围较广，调用前必须逐工具确认权限、数据流和执行风险。', transport: '外部 MCPB 包' }),
  makeMarketplaceMcp({ id: 'medidata', title: 'Medidata', description: '连接 Medidata 平台帮助与临床试验站点预测排序。', icon: '📊', tags: ['Medidata', '临床试验', '站点选择'], requirement: '需要 Medidata 服务与对应账户权限。', caution: '站点排序是辅助信息，不能替代申办方的临床运营和合规审查。' }),
  makeMarketplaceMcp({ id: 'cortellis', title: 'Cortellis Regulatory Intelligence', description: '访问全球药物申报、批准、指导文件和监管情报。', icon: '📋', tags: ['监管情报', '药物开发', '合规'], requirement: '需要 Cortellis 订阅。', caution: '监管情报会变化，正式决策必须核对主管机关原始文件。' }),
  makeMarketplaceMcp({ id: 'adisinsight', title: 'AdisInsight', description: '查询药物开发管线、临床试验、安全和交易情报。', icon: '💊', tags: ['药物管线', '临床试验', '交易情报'], requirement: '需要 AdisInsight 订阅。', caution: '商业情报和管线状态可能变化，应核对原始公司及注册来源。' }),
];

const KNOWLEDGE_REPOSITORY = 'https://github.com/anthropics/knowledge-work-plugins';
const KNOWLEDGE_REVISION = 'e1f73c1d4ac2677518180d2810b3ccc7489632fa';
const KNOWLEDGE_BLOB = `${KNOWLEDGE_REPOSITORY}/blob/${KNOWLEDGE_REVISION}`;

const bioResearchPlugin = createSourceCandidate({
  slug: 'anthropic-bio-research',
  title: 'Bio-Research Plugin',
  description: '汇总科研文献、组学、药物靶点连接器与分析 Skill 的生物医药研发插件包。',
  type: 'Plugin',
  icon: '🧬',
  author: 'Anthropic',
  authorSlug: 'anthropics',
  tags: ['生物医药', '科研工作流', '插件包'],
  repositoryUrl: KNOWLEDGE_REPOSITORY,
  revision: KNOWLEDGE_REVISION,
  revisionCommittedAt: '2026-08-13T00:30:11Z',
  fetchedAt: FETCHED_AT,
  rootPath: 'bio-research',
  manifestPath: 'bio-research/.claude-plugin/plugin.json',
  project: {
    ...OWNER,
    declaredVersion: '1.2.0',
    license: {
      spdx: 'Apache-2.0',
      name: 'Apache License 2.0',
      evidenceUrl: `${KNOWLEDGE_BLOB}/bio-research/LICENSE#L1-L4`,
    },
    capabilities: [
      sourceFact('科研连接器集合', '整合文献、组学、药靶和生物医药研究相关连接器。', `${KNOWLEDGE_BLOB}/bio-research/README.md#L1-L79`),
      sourceFact('分析 Skill 集合', '提供单细胞、测序、药物发现、文献综述和研究策略等分析工作流。', `${KNOWLEDGE_BLOB}/bio-research/README.md#L1-L79`),
    ],
    installationMethods: [
      installationFact('安装插件包', '使用 Anthropic knowledge-work-plugins 安装 bio-research。', '/install anthropics/knowledge-work-plugins bio-research', `${KNOWLEDGE_BLOB}/bio-research/README.md#L54-L62`),
    ],
    requirements: [sourceFact('连接器与账户', '具体 MCP、外部 binary 和服务账户按所用功能分别配置。', `${KNOWLEDGE_BLOB}/bio-research/README.md#L1-L79`)],
    integrations: [sourceFact('Claude Code / Cowork', '官方 README 将该资源作为生物研究插件包提供。', `${KNOWLEDGE_BLOB}/bio-research/README.md#L1-L79`)],
    cautions: [sourceFact('逐服务核对', '插件包聚合的 MCP 仍受各提供方账户、许可证和数据条款约束。', `${KNOWLEDGE_BLOB}/bio-research/README.md#L1-L79`)],
  },
});

export const anthropicScienceResources = Object.freeze([
  ...skillCandidates,
  ...mcpCandidates,
  bioResearchPlugin,
]);

export const anthropicScienceAuthors = Object.freeze([
  createSourceAuthor({
    slug: 'anthropics',
    name: 'Anthropic',
    homepage: 'https://github.com/anthropics',
  }),
]);
