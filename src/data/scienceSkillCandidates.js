import {
  createSourceAuthor,
  createSourceCandidate,
  installationFact,
  sourceFact,
} from './sourceCandidateFactory.js';

const FETCHED_AT = '2026-08-13T09:10:00Z';

const makeSkill = ({
  slug,
  title,
  description,
  icon,
  tags,
  repositoryUrl,
  revision,
  revisionCommittedAt,
  rootPath,
  manifestPath,
  author,
  authorSlug,
  ownerUrl,
  ownerAvatarUrl,
  declaredVersion = null,
  license = 'MIT',
  licensePath = 'LICENSE',
  evidencePath = manifestPath,
  capabilities,
  installTitle,
  installDescription,
  installCommand,
  installEvidencePath,
  requirement,
  caution,
}) => {
  const blob = `${repositoryUrl}/blob/${revision}`;
  const evidenceUrl = `${blob}/${evidencePath}`;
  return createSourceCandidate({
    slug,
    title,
    description,
    type: 'Skill',
    icon,
    author,
    authorSlug,
    tags,
    repositoryUrl,
    revision,
    revisionCommittedAt,
    fetchedAt: FETCHED_AT,
    rootPath,
    manifestPath,
    project: {
      declaredVersion,
      ownerUrl,
      ownerAvatarUrl,
      license: {
        spdx: license,
        name: license === 'MIT' ? 'MIT License' : license,
        evidenceUrl: `${blob}/${licensePath}`,
      },
      capabilities: capabilities.map(([factTitle, factDescription]) => (
        sourceFact(factTitle, factDescription, evidenceUrl)
      )),
      installationMethods: [
        installationFact(
          installTitle,
          installDescription,
          installCommand,
          `${blob}/${installEvidencePath}`,
        ),
      ],
      requirements: [sourceFact('运行前提', requirement, evidenceUrl)],
      integrations: [sourceFact('Agent Skill', '仓库以 SKILL.md 工作流形式提供该资源。', evidenceUrl)],
      cautions: [sourceFact('使用边界', caution, evidenceUrl)],
    },
  });
};

const SCIATLAS_REPOSITORY = 'https://github.com/zjunlp/SciAtlas';
const SCIATLAS_REVISION = 'a9a345da42606e6979bb6cedde9b047691b0df4c';
const SCIATLAS_COMMON = {
  repositoryUrl: SCIATLAS_REPOSITORY,
  revision: SCIATLAS_REVISION,
  revisionCommittedAt: '2026-07-16T14:55:50Z',
  author: 'Zhejiang University NLP Lab',
  authorSlug: 'zjunlp',
  ownerUrl: 'https://github.com/zjunlp',
  ownerAvatarUrl: 'https://avatars.githubusercontent.com/u/41887875?v=4',
  licensePath: 'LICENSE#L1-L21',
  installTitle: '复制到 Codex skills',
  installDescription: '克隆 SciAtlas 后，把对应 Skill 目录复制到 Codex skills 目录。',
  installEvidencePath: 'agent-skill/README.md#L128-L146',
};

const makeSciAtlasSkill = ({ slug, title, description, icon, tags, folder, capabilities, requirement, caution }) => (
  makeSkill({
    ...SCIATLAS_COMMON,
    slug,
    title,
    description,
    icon,
    tags,
    rootPath: `agent-skill/${folder}`,
    manifestPath: `agent-skill/${folder}/SKILL.md`,
    evidencePath: `agent-skill/${folder}/SKILL.md#L1-L42`,
    installCommand: `git clone https://github.com/zjunlp/SciAtlas.git && cd SciAtlas && mkdir -p ~/.codex/skills && cp -R ./agent-skill/${folder} ~/.codex/skills/`,
    capabilities,
    requirement,
    caution,
  })
);

const sciatlasSkills = [
  makeSciAtlasSkill({
    slug: 'sciatlas-literature-review',
    title: 'SciAtlas Literature Review',
    description: '基于 SciAtlas 论文后端组织主题剖析、证据包、方法聚类与时间切片综述。',
    icon: '📚',
    tags: ['文献综述', '论文地图', 'SciAtlas'],
    folder: 'sciatlas-literature-review',
    capabilities: [
      ['综述结构与论文地图', '生成 survey outline、paper map、related work 与正式综述草稿。'],
      ['证据组织', '围绕主题、方法和时间切片组织检索结果与证据包。'],
    ],
    requirement: '需要完整 SciAtlas checkout、workflow requirements、SciAtlas token；综合写作还需要 LLM 配置。',
    caution: '该 Skill 要求使用 SciAtlas literature-review workflow；后端失败时不应静默换用其他检索来源。',
  }),
  makeSciAtlasSkill({
    slug: 'sciatlas-quick-paper-search',
    title: 'SciAtlas Quick Paper Search',
    description: '面向选题初筛，生成小规模、可追溯的相关论文集与摘要。',
    icon: '🔎',
    tags: ['论文检索', '选题初筛', 'SciAtlas'],
    folder: 'sciatlas-quick-paper-search',
    capabilities: [
      ['快速论文集', '通过 search-papers 形成可追溯的小规模检索结果。'],
      ['检索产物阅读', '组织 retrieval、artifact 阅读和摘要输出。'],
    ],
    requirement: '需要 SciAtlas CLI 与 SCIATLAS_API_KEY；注册和邮件验证码可能需要人工完成。',
    caution: '只使用仓库声明的 search-papers 路径，且不得在输出中暴露完整 token。',
  }),
  makeSciAtlasSkill({
    slug: 'sciatlas-idea-evaluate',
    title: 'SciAtlas Idea Evaluate',
    description: '用文献证据与 reviewer rubric 审视研究想法或论文。',
    icon: '🧪',
    tags: ['研究想法', '同行评审', '证据'],
    folder: 'sciatlas-idea-evaluate',
    capabilities: [
      ['文献证据评估', '结合知识图谱与论文证据检查段落 claim grounding。'],
      ['结构化审稿', '生成 rubric、reviewer report 和最终评估报告。'],
    ],
    requirement: '需要完整 checkout、workflow requirements；SciAtlas、LLM、S2 与 KG 配置按实际模式决定。',
    caution: '仅执行仓库声明的 idea-evaluate workflow，输出仍是研究辅助意见。',
  }),
  makeSciAtlasSkill({
    slug: 'sciatlas-idea-generate',
    title: 'SciAtlas Idea Generate',
    description: '利用锚论文、研究图与跨领域检索产生并初步校验研究想法。',
    icon: '💡',
    tags: ['研究创意', '知识图谱', '新颖性'],
    folder: 'sciatlas-idea-generate',
    capabilities: [
      ['研究灵感生成', '从同领域与跨领域论文图谱生成选题种子。'],
      ['初步新颖性检查', '围绕生成想法执行仓库定义的 novelty check。'],
    ],
    requirement: '默认 hosted mode 需要 SciAtlas token 与 LLM 配置；local KG mode 才需要 Neo4j 和本地知识图谱。',
    caution: '生成结果只是研究种子，不代表新颖性、可行性或发表价值已被验证。',
  }),
  makeSciAtlasSkill({
    slug: 'sciatlas-trend-report',
    title: 'SciAtlas Trend Report',
    description: '基于论文时间维度形成领域演化、代表工作与新兴方向报告。',
    icon: '📈',
    tags: ['趋势报告', '时间线', '文献分析'],
    folder: 'sciatlas-trend-report',
    capabilities: [
      ['领域时间线', '按时间范围组织代表论文和领域演化。'],
      ['新兴方向报告', '从 search-papers 结果生成趋势导向的研究报告。'],
    ],
    requirement: '需要 SciAtlas CLI 与 SCIATLAS_API_KEY。',
    caution: '仅使用 search-papers 结果；趋势判断受检索覆盖和时间范围影响。',
  }),
  makeSciAtlasSkill({
    slug: 'sciatlas-researcher-review',
    title: 'SciAtlas Researcher Review',
    description: '从检索论文生成研究者代表作、主题轨迹与研究概览。',
    icon: '👤',
    tags: ['研究者画像', '代表作', '主题轨迹'],
    folder: 'sciatlas-researcher-review',
    capabilities: [
      ['代表作检索', '从 search-papers 结果组织研究者代表论文。'],
      ['研究轨迹概览', '生成文献支撑的主题与时间轨迹。'],
    ],
    requirement: '需要 SciAtlas CLI 与 SCIATLAS_API_KEY。',
    caution: '仓库明确说明输出不是权威简历，作者消歧和遗漏仍需人工核对。',
  }),
];

const researchPaperReview = makeSkill({
  slug: 'research-paper-review',
  title: 'Research Paper Review',
  description: '面向论文的结构化审读、方法与新颖性检查、数值一致性核对和投稿前建议。',
  type: 'Skill',
  icon: '🧐',
  tags: ['论文审阅', '方法检查', '投稿准备'],
  repositoryUrl: 'https://github.com/BESSER-PEARL/research-agent-skills',
  revision: '03d3c49ac1698c9d29cc4c0f5e8eeca17210bd51',
  revisionCommittedAt: '2026-07-14T11:57:26Z',
  rootPath: 'research-paper-review',
  manifestPath: 'research-paper-review/SKILL.md',
  author: 'BESSER-PEARL',
  authorSlug: 'besser-pearl',
  ownerUrl: 'https://github.com/BESSER-PEARL',
  ownerAvatarUrl: 'https://avatars.githubusercontent.com/u/138102430?v=4',
  declaredVersion: '1.0.0',
  licensePath: 'LICENSE#L1-L15',
  evidencePath: 'research-paper-review/SKILL.md#L1-L49',
  capabilities: [
    ['结构化论文审读', '支持 PDF、LaTeX 或文本输入，并按 venue 与 paper type 组织批评。'],
    ['一致性与相关工作检查', '覆盖方法、新颖性、统计或数值一致性和相关工作审查。'],
  ],
  installTitle: 'Skills CLI',
  installDescription: '使用仓库 README 提供的 skills 安装命令。',
  installCommand: 'npx skills add BESSER-PEARL/agent-skills@research-paper-review',
  installEvidencePath: 'README.md#L16-L32',
  requirement: '需要提供论文内容；建议同时给出目标 venue 和 paper type。',
  caution: 'paper type 不明确时应询问或显式写出假设，不能把审稿意见当录用或研究真实性结论。',
});

const BIOSKILLS_REPOSITORY = 'https://github.com/GPTomics/bioSkills';
const BIOSKILLS_REVISION = '2b459ce66acafa62673abd95277dc4b41b9ec130';
const BIOSKILLS_COMMON = {
  repositoryUrl: BIOSKILLS_REPOSITORY,
  revision: BIOSKILLS_REVISION,
  revisionCommittedAt: '2026-08-11T22:39:26Z',
  author: 'GPTomics',
  authorSlug: 'gptomics',
  ownerUrl: 'https://github.com/GPTomics',
  ownerAvatarUrl: 'https://avatars.githubusercontent.com/u/128078558?v=4',
  licensePath: 'LICENSE#L1-L15',
  installTitle: 'Codex installer',
  installDescription: '克隆 bioSkills 并按分类安装到 Codex。',
  installEvidencePath: 'README.md#L51-L77',
};

const bioSkills = [
  makeSkill({
    ...BIOSKILLS_COMMON,
    slug: 'bio-single-cell-batch-integration',
    title: 'Single-Cell Batch Integration',
    description: '为多批次 scRNA-seq 选择整合方法、评估质量并控制过度校正风险。',
    icon: '🧬',
    tags: ['单细胞', '批次整合', 'scRNA-seq'],
    rootPath: 'single-cell/batch-integration',
    manifestPath: 'single-cell/batch-integration/SKILL.md',
    evidencePath: 'single-cell/batch-integration/SKILL.md#L1-L37',
    capabilities: [
      ['整合方法选择', '覆盖 Harmony、scVI/scANVI、Seurat、fastMNN、Scanorama 和 BBKNN 等策略。'],
      ['整合质量评估', '使用 scIB 等指标检查批次混合、生物信号保留和过度校正。'],
    ],
    installCommand: 'git clone https://github.com/GPTomics/bioSkills.git && cd bioSkills && ./install-codex.sh --categories "single-cell"',
    requirement: '仓库列出 scanpy、Seurat、scvi-tools、harmonypy 等参考依赖；实际版本需要安装前核对。',
    caution: '批次和真实生物信号混杂时算法无法自动区分；校正表达不应直接用于差异表达。',
  }),
  makeSkill({
    ...BIOSKILLS_COMMON,
    slug: 'bio-admet-prediction',
    title: 'ADMET Prediction',
    description: '组织药物候选的吸收、分布、代谢、排泄、毒性预测与适用域检查。',
    icon: '💊',
    tags: ['ADMET', '药物发现', '化学信息学'],
    rootPath: 'chemoinformatics/admet-prediction',
    manifestPath: 'chemoinformatics/admet-prediction/SKILL.md',
    evidencePath: 'chemoinformatics/admet-prediction/SKILL.md#L1-L91',
    capabilities: [
      ['ADMET 模型工作流', '覆盖 ADMETlab、ADMET-AI、DeepChem、chemprop 和结构过滤。'],
      ['风险端点与适用域', '组织 hERG、CYP、AMES 等端点，并检查模型校准与适用域。'],
    ],
    installCommand: 'git clone https://github.com/GPTomics/bioSkills.git && cd bioSkills && ./install-codex.sh --categories "chemoinformatics"',
    requirement: '仓库列出 RDKit、DeepChem、chemprop、admet-ai 等参考依赖；hosted service 条件需查询当期文档。',
    caution: '模型预测不能作为临床或监管结论；超出适用域的结果需要特别标记。',
  }),
];

export const scienceSkillResources = Object.freeze([
  ...sciatlasSkills,
  researchPaperReview,
  ...bioSkills,
]);

export const scienceSkillAuthors = Object.freeze([
  createSourceAuthor({ slug: 'zjunlp', name: 'Zhejiang University NLP Lab', homepage: 'https://github.com/zjunlp' }),
  createSourceAuthor({ slug: 'besser-pearl', name: 'BESSER-PEARL', homepage: 'https://github.com/BESSER-PEARL' }),
  createSourceAuthor({ slug: 'gptomics', name: 'GPTomics', homepage: 'https://github.com/GPTomics' }),
]);
