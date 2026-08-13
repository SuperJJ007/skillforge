// Legacy prototype fixture. Production-facing code must not import this module
// directly; LocalResourceRepository is the only adapter allowed to read it and
// removes unsupported ratings, downloads, Bench, install, GitHub and evidence fields.

export const academicBundles = [
  {
    id: 'single-cell-toolkit',
    title: '单细胞全流程 Agent 推荐组合',
    disciplineId: 'biology',
    description: '包含数据预处理、Seurat 差异表达分析、CellTypist 自动细胞类型注释与伪时间轨迹推演。',
    icon: '🧪',
    itemCount: 4,
    tags: ['单细胞', 'Seurat', '轨迹分析']
  },
  {
    id: 'alphafold-docking-suite',
    title: 'AlphaFold3 联用分子对接大师包',
    disciplineId: 'biology',
    description: '从 UniProt 提取结构到 AutoDock Vina 虚拟筛选及 PyMOL 3D 高清渲染全自动化流程。',
    icon: '🧬',
    itemCount: 3,
    tags: ['蛋白质', '分子对接', '结构生物学']
  },
  {
    id: 'deep-learning-benchmark-pack',
    title: '科研大模型训练与架构评估包',
    disciplineId: 'computer-science',
    description: '自动分析 PyTorch FLOPs、显存瓶颈诊断及 HuggingFace 极速模型拉取调试。',
    icon: '💻',
    itemCount: 3,
    tags: ['PyTorch', '显存优化', '模型诊断']
  }
];

export const pipelineTemplates = [
  {
    id: 'scrna-pipeline',
    title: '单细胞转录组分析全流程',
    icon: '🧫',
    disciplineId: 'biology',
    scenario: '我有多组小鼠 scRNA-seq 数据，想做质控、降维聚类与细胞类型自动注释',
    inputs: '10x Genomics 计数矩阵 (多样本)',
    estTime: '约 1–2 小时 (Agent 自动化)',
    tags: ['单细胞', 'scRNA-seq', '细胞注释'],
    steps: [
      {
        name: '质控过滤与降维聚类',
        toolId: 'seurat-sc-pipeline',
        description: '自动执行线粒体比例过滤、归一化、PCA/UMAP 降维与 Marker 基因识别。',
        output: 'Seurat 对象 (.rds，含 UMAP 坐标)'
      },
      {
        name: '自动细胞类型注释',
        toolId: 'celltypist-annotator',
        description: '基于预训练机器学习模型对聚类结果进行跨组织细胞类型标注。',
        output: '带注释标签的表达矩阵 (AnnData)'
      }
    ]
  },
  {
    id: 'drug-discovery',
    title: '靶点发现 → 结构检索 → 分子对接',
    icon: '💊',
    disciplineId: 'biology',
    scenario: '我想为某疾病寻找候选药物靶点，获取蛋白结构并做小分子虚拟筛选',
    inputs: '疾病名称 / 表型关键词',
    estTime: '约 30 分钟 (靶点检索) + 对接计算时长',
    tags: ['药物发现', '分子对接', '结构生物学'],
    steps: [
      {
        name: '疾病靶点发现',
        toolId: 'opentargets-query',
        description: '查询 Open Targets 平台，按证据评分筛选高置信度靶点并评估可药性。',
        output: '候选靶点基因列表 (含 Tractability 评分)'
      },
      {
        name: '蛋白结构检索与置信度评估',
        toolId: 'alphafold-db-api',
        description: '通过 UniProt 编号提取 AlphaFold 预测结构，屏蔽低置信度无序区。',
        output: '靶点结构文件 (CIF/PDB) + pLDDT 置信度'
      },
      {
        name: '分子对接虚拟筛选',
        toolId: 'autodock-vina-runner',
        description: '自动识别结合口袋，执行受体-配体对接并按结合自由能排序。',
        output: '对接构象与结合能 (kcal/mol) 排序表'
      }
    ]
  },
  {
    id: 'multi-omics',
    title: '多组学联合建模与因子整合',
    icon: '🧬',
    disciplineId: 'biology',
    scenario: '我有配对的 RNA-seq、表面蛋白 (CITE-seq) 数据，想联合建模找出共享潜在因子',
    inputs: '配对的转录组 + ADT 蛋白表达数据',
    estTime: '约 2–3 小时',
    tags: ['多组学', 'CITE-seq', '因子分析'],
    steps: [
      {
        name: 'CITE-seq ADT 标签解拆',
        toolId: 'cite-seq-demux',
        description: '解析表面蛋白抗体寡核苷酸标签与细胞条形码，生成蛋白表达矩阵。',
        output: 'ADT 蛋白计数矩阵'
      },
      {
        name: 'RNA-seq 预处理与质控',
        toolId: 'seurat-sc-pipeline',
        description: '对转录组数据执行标准化与质量过滤，与蛋白矩阵对齐样本。',
        output: '质控后的基因表达矩阵'
      },
      {
        name: '多组学因子整合建模',
        toolId: 'mofa-integration',
        description: '非监督因子模型联合两组学数据，提取跨平台共享变异来源。',
        output: '潜在因子矩阵 + 方差解释率报告'
      }
    ]
  },
  {
    id: 'structure-function',
    title: '蛋白结构 → 互作网络功能分析',
    icon: '🕸️',
    disciplineId: 'biology',
    scenario: '我关注一个目标基因，想看它的结构置信度并构建蛋白互作网络与通路富集',
    inputs: '目标基因 / UniProt 编号',
    estTime: '约 15 分钟',
    tags: ['蛋白质', 'PPI', '通路富集'],
    steps: [
      {
        name: '结构检索与置信度评估',
        toolId: 'alphafold-db-api',
        description: '提取目标蛋白预测结构，定位低置信度无序区 (IDR)。',
        output: '结构文件 + 残基级 pLDDT 评分'
      },
      {
        name: '互作网络构建与富集',
        toolId: 'string-db-ppi',
        description: '查询 STRING 数据库获取 PPI 网络，执行 GO/KEGG 富集分析。',
        output: 'PPI 网络拓扑 + 富集分析结果 (可导出 Cytoscape)'
      }
    ]
  },
  {
    id: 'model-profiling',
    title: '开源模型拉取 → 训练性能诊断',
    icon: '💻',
    disciplineId: 'computer-science',
    scenario: '我想从 HuggingFace 拉取开源大模型，在微调前诊断 FLOPs 与显存瓶颈',
    inputs: 'HuggingFace 模型 ID',
    estTime: '约 40 分钟 (含权重下载)',
    tags: ['PyTorch', '显存优化', 'LLM'],
    steps: [
      {
        name: '模型权重下载与校验',
        toolId: 'hf-hub-connector',
        description: '极速下载并校验权重完整性，可选 AWQ 4-bit 量化版本。',
        output: '本地权重文件 (safetensors / GGUF)'
      },
      {
        name: '算力与显存剖析',
        toolId: 'pytorch-model-profiler',
        description: '解析模型架构 FLOPs，跟踪 CUDA 显存分配，定位耗时算子。',
        output: '算子耗时报告 + 显存峰值诊断'
      }
    ]
  },
  {
    id: 'quantum-prototype',
    title: '量子电路原型验证',
    icon: '⚛️',
    disciplineId: 'physics',
    scenario: '我设计了一个变分量子电路，想在真实硬件运行前先模拟态矢量与测量概率',
    inputs: '量子电路定义 (门序列 / QASM)',
    estTime: '约 10 分钟',
    tags: ['量子计算', '电路模拟', 'Qiskit'],
    steps: [
      {
        name: '电路构建与态矢量模拟',
        toolId: 'qiskit-circuit-sim',
        description: '构建量子门阵列，求解态矢量并计算测量概率分布，可选含噪声模拟。',
        output: '态矢量、测量概率分布与电路深度报告'
      }
    ]
  }
];

// Keyword dictionary for natural-language pipeline matching
const PIPELINE_KEYWORDS = {
  'scrna-pipeline': ['单细胞', 'scRNA', '转录组', '测序', '聚类', 'UMAP', '降维', '注释', '细胞类型', '质控', 'single-cell', 'RNA-seq'],
  'drug-discovery': ['药物', '靶点', '对接', '虚拟筛选', '小分子', '抑制剂', '先导化合物', '结合能', 'docking', '疾病'],
  'multi-omics': ['多组学', '甲基化', 'ATAC', 'CITE', '蛋白表达', '整合', '联合分析', '因子', 'multi-omics'],
  'structure-function': ['蛋白结构', 'AlphaFold', 'pLDDT', '互作', 'PPI', '通路', '富集', '无序区', '结构生物学'],
  'model-profiling': ['训练', '微调', '显存', 'FLOPs', '算力', '泄漏', '瓶颈', '模型诊断', 'GPU', 'HuggingFace', '拉取'],
  'quantum-prototype': ['量子', '比特', '电路', '叠加', '纠缠', '态矢量', 'qubit', 'Bell', '变分']
};

export const matchPipelines = (query) => {
  if (!query || query.trim() === '') return [];
  const q = query.toLowerCase();
  const scored = pipelineTemplates.map(p => {
    const keywords = PIPELINE_KEYWORDS[p.id] || [];
    const hits = keywords.filter(k => q.includes(k.toLowerCase()));
    return { pipeline: p, score: hits.length };
  }).filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.map(item => item.pipeline);
};

// ============================================================
// Evidence-Based Bench 评测证据注册表
// 每个任务独立运行 runsPerTask 次，对照组 = 同一宿主模型不加载任何 Skill
// ============================================================
export const BENCH_METHODOLOGY = [
  '每个评测任务在隔离沙箱中独立运行 5 次，取通过次数计算通过率；',
  '对照组（Baseline）为同一宿主模型、同一提示词但不加载任何 Skill / MCP；',
  '判定标准 = 自动化断言（输出文件存在性 / 数值阈值 / 格式校验）+ 人工抽检；',
  '延迟与 Token 消耗为 5 次运行的中位数；环境配置在每次评测报告中完整披露。'
];

export const benchRegistry = {
  'seurat-sc-pipeline': {
    verified: true,
    lastRun: '2026-07-28',
    model: 'Claude Sonnet 4.5',
    harness: 'SciForge Harness v2.3.1 (Claude Desktop)',
    runsPerTask: 5,
    aggregate: { passRate: 100, baseline: 22 },
    tasks: [
      { name: 'PBMC 3k 标准流程', desc: '从原始计数矩阵到 QC、归一化、PCA/UMAP 与聚类报告', baseline: 20, withSkill: 100, latency: '6m 40s', tokens: '48k' },
      { name: '多样本批次整合', desc: '3 组小鼠样本 Integration，批次效应校正后联合 UMAP', baseline: 20, withSkill: 100, latency: '11m 05s', tokens: '76k' },
      { name: '低质量样本拒绝执行', desc: '输入空矩阵时应拒绝并给出诊断，而非产出错误结果', baseline: 40, withSkill: 100, latency: '1m 12s', tokens: '9k' }
    ],
    cases: [
      { title: 'PBMC 3k 端到端', prompt: '读取 pbmc3k_filtered_matrix.mtx，执行标准 Seurat 流程：QC（MT% ≤ 10%）→ 归一化 → 高变基因 → PCA → UMAP → 聚类，输出 RDS。', expected: 'seurat_pbmc3k.rds 可被 ReadRDS 加载，UMAP 坐标列存在，聚类数 ≥ 5。', rubric: ['输出 RDS 可加载', 'UMAP 聚类 ≥ 5 个', 'MT% 过滤阈值 ≤ 10%'] },
      { title: '批次整合鲁棒性', prompt: '对 mouse_liver_1/2/3.h5 三个样本执行 Integration 并绘制联合 UMAP，标注批次来源。', expected: '整合后 UMAP 中同一细胞类型跨批次混合，无按批次分岛现象。', rubric: ['跨批次混合度 > 0.7', '无批次孤岛', '运行无 OOM'] }
    ]
  },
  'celltypist-annotator': {
    verified: true,
    lastRun: '2026-07-30',
    model: 'Claude Sonnet 4.5',
    harness: 'SciForge Harness v2.3.1 (Cursor)',
    runsPerTask: 5,
    aggregate: { passRate: 100, baseline: 27 },
    tasks: [
      { name: '免疫细胞图谱自动注释', desc: '对 PBMC 聚类结果执行跨组织细胞类型标注', baseline: 20, withSkill: 100, latency: '4m 20s', tokens: '31k' },
      { name: '注释标签准确率对照', desc: '与人工专家标注对比，Macro-F1 达标线 0.85', baseline: 40, withSkill: 93, latency: '4m 35s', tokens: '33k' },
      { name: '未知细胞类型回退', desc: '遇到模型未见过的类型时应标记 unassigned 而非强行归类', baseline: 20, withSkill: 100, latency: '2m 50s', tokens: '18k' }
    ],
    cases: [
      { title: 'PBMC 注释一致性', prompt: '对 seurat_pbmc3k.rds 的聚类执行 CellTypist 注释（Immune_All_Low 模型），输出标签列。', expected: '每个 cluster 获得唯一主标签，CD4 T / CD14 Mono / B 等主群可识别。', rubric: ['标签列写入成功', '主群召回 ≥ 90%', 'Macro-F1 ≥ 0.85'] }
    ]
  },
  'mofa-integration': {
    verified: true,
    lastRun: '2026-07-22',
    model: 'Claude Sonnet 4.5',
    harness: 'SciForge Harness v2.3.1 (Linux 容器)',
    runsPerTask: 5,
    aggregate: { passRate: 87, baseline: 13 },
    tasks: [
      { name: '双组学因子提取', desc: 'RNA + ADT 配对数据联合建模，提取共享因子', baseline: 20, withSkill: 100, latency: '14m 30s', tokens: '82k' },
      { name: '方差解释率报告', desc: '输出每个因子的 R² 分解与组学贡献度', baseline: 0, withSkill: 100, latency: '15m 10s', tokens: '85k' },
      { name: 'Windows 环境降级处理', desc: 'MOFA+ 不支持 Windows，应给出 WSL/Docker 替代方案而非直接失败', baseline: 20, withSkill: 60, latency: '2m 05s', tokens: '12k' }
    ],
    cases: [
      { title: '因子可解释性', prompt: '对 cbmc_rna.h5ad 与 cbmc_adt.h5ad 执行 MOFA+ 联合训练，输出前 10 个因子的方差解释率。', expected: 'Factor 1 同时解释两组学 > 5% 方差，输出 HTML 报告。', rubric: ['训练收敛', '共享因子方差 > 5%', '报告可打开'] }
    ]
  },
  'cite-seq-demux': {
    verified: true,
    lastRun: '2026-07-18',
    model: 'Claude Sonnet 4.5',
    harness: 'SciForge Harness v2.3.1 (Claude Desktop)',
    runsPerTask: 5,
    aggregate: { passRate: 93, baseline: 20 },
    tasks: [
      { name: 'ADT 标签解拆', desc: '从 FASTQ 解析抗体寡核苷酸标签生成蛋白矩阵', baseline: 20, withSkill: 100, latency: '8m 15s', tokens: '54k' },
      { name: '双细胞检测', desc: '基于 hashtag 信号识别并标记 doublet', baseline: 20, withSkill: 100, latency: '9m 40s', tokens: '61k' },
      { name: '标签错配容错', desc: '含 5% 噪声标签的输入下仍保持解拆准确率', baseline: 20, withSkill: 80, latency: '8m 55s', tokens: '57k' }
    ],
    cases: [
      { title: '解拆矩阵校验', prompt: '处理 cite_adt_fastq/ 目录，输出 ADT 计数矩阵与 hashtag 分配结果。', expected: '矩阵维度 = 细胞数 × 抗体数，双细胞比例在合理区间 (2–8%)。', rubric: ['矩阵维度正确', 'doublet 检出率 2–8%', '无未分配 majority'] }
    ]
  },
  'opentargets-query': {
    verified: true,
    lastRun: '2026-08-01',
    model: 'Claude Sonnet 4.5',
    harness: 'SciForge Harness v2.3.1 (Qoder)',
    runsPerTask: 5,
    aggregate: { passRate: 93, baseline: 27 },
    tasks: [
      { name: '疾病关联靶点检索', desc: '按疾病名检索关联靶点并按证据评分排序', baseline: 40, withSkill: 100, latency: '2m 30s', tokens: '21k' },
      { name: '可药性评估', desc: '输出 Tractability 分桶（小分子 / 抗体 / 其他）', baseline: 20, withSkill: 100, latency: '2m 45s', tokens: '24k' },
      { name: 'API 限流重试', desc: 'GraphQL 限流时自动退避重试而非报错退出', baseline: 20, withSkill: 80, latency: '3m 20s', tokens: '26k' }
    ],
    cases: [
      { title: '阿尔茨海默病靶点', prompt: '查询阿尔茨海默病 (MONDO:0004975) 关联靶点 Top 20，含证据评分与 Tractability。', expected: 'APP/PSEN1/TREM2 等已知靶点出现在前列，字段完整。', rubric: ['Top20 含已知靶点', '评分降序排列', '无空字段'] }
    ]
  },
  'alphafold-db-api': {
    verified: true,
    lastRun: '2026-08-03',
    model: 'Claude Sonnet 4.5',
    harness: 'SciForge Harness v2.3.1 (Cursor)',
    runsPerTask: 5,
    aggregate: { passRate: 93, baseline: 33 },
    tasks: [
      { name: '结构检索与 pLDDT 评估', desc: '按 UniProt ID 提取结构并输出置信度摘要', baseline: 40, withSkill: 100, latency: '1m 50s', tokens: '15k' },
      { name: '低置信度区域屏蔽', desc: 'pLDDT < 50 区域自动标记为无序区并排除出对接输入', baseline: 20, withSkill: 100, latency: '2m 10s', tokens: '17k' },
      { name: '物种 ID 映射', desc: '基因名 → 正确物种 UniProt 编号的歧义消解', baseline: 40, withSkill: 80, latency: '2m 25s', tokens: '19k' }
    ],
    cases: [
      { title: 'Tau 蛋白结构提取', prompt: '获取人源 Tau (P10636-8) 的 AlphaFold 结构，标记 IDR 区域并输出可用于对接的刚性片段。', expected: '返回 CIF 文件；微管结合域 pLDDT > 70，N/C 末端被标记为 IDR。', rubric: ['CIF 可解析', 'IDR 标记正确', '刚性片段输出'] }
    ]
  },
  'autodock-vina-runner': {
    verified: true,
    lastRun: '2026-07-25',
    model: 'Claude Sonnet 4.5',
    harness: 'SciForge Harness v2.3.1 (Linux, GPU 可选)',
    runsPerTask: 5,
    aggregate: { passRate: 87, baseline: 20 },
    tasks: [
      { name: '结合口袋自动识别', desc: '基于已知配体位置生成对接搜索空间', baseline: 20, withSkill: 100, latency: '3m 40s', tokens: '28k' },
      { name: '单分子对接打分', desc: '受体-配体对接并输出结合自由能排序', baseline: 20, withSkill: 100, latency: '12m 20s', tokens: '45k' },
      { name: '大分子库虚拟筛选', desc: '100 分子批量对接的稳定性与断点续跑', baseline: 20, withSkill: 60, latency: '1h 35m', tokens: '210k' }
    ],
    cases: [
      { title: '已知抑制剂重现', prompt: '将 Imatinib 对接至 ABL1 激酶域 (2HYY)，重现晶体构象。', expected: '最优构象 RMSD ≤ 2.0 Å，结合能 ≤ -9 kcal/mol。', rubric: ['RMSD ≤ 2.0 Å', '结合能 ≤ -9 kcal/mol', '输出 PDBQT 文件'] }
    ]
  },
  'string-db-ppi': {
    verified: true,
    lastRun: '2026-07-20',
    model: 'Claude Sonnet 4.5',
    harness: 'SciForge Harness v2.3.1 (Claude Desktop)',
    runsPerTask: 5,
    aggregate: { passRate: 100, baseline: 33 },
    tasks: [
      { name: 'PPI 网络构建', desc: '基因列表 → STRING 网络拓扑与中心性分析', baseline: 40, withSkill: 100, latency: '2m 15s', tokens: '19k' },
      { name: 'GO/KEGG 富集', desc: '网络节点富集分析并输出校正后 p 值', baseline: 20, withSkill: 100, latency: '2m 50s', tokens: '23k' },
      { name: 'Cytoscape 导出', desc: '导出 .xgmml 供 Cytoscape 打开渲染', baseline: 40, withSkill: 100, latency: '2m 30s', tokens: '20k' }
    ],
    cases: [
      { title: 'p53 通路网络', prompt: '以 TP53 为核心构建 10 层邻居 PPI 网络（score ≥ 0.7），执行 KEGG 富集。', expected: '网络含 MDM2/CDKN1A 等已知互作，p53 signaling 通路显著富集。', rubric: ['已知互作召回', 'p53 通路 p < 0.01', 'xgmml 可打开'] }
    ]
  },
  'pytorch-model-profiler': {
    verified: true,
    lastRun: '2026-07-29',
    model: 'Claude Sonnet 4.5',
    harness: 'SciForge Harness v2.3.1 (Linux, A10G)',
    runsPerTask: 5,
    aggregate: { passRate: 100, baseline: 20 },
    tasks: [
      { name: '显存泄漏定位', desc: '追踪训练循环 CUDA 显存增长并定位泄漏算子', baseline: 20, withSkill: 100, latency: '9m 10s', tokens: '64k' },
      { name: 'FLOPs 与算子热点', desc: '解析模型架构计算量，输出 Top-10 耗时算子', baseline: 20, withSkill: 100, latency: '5m 45s', tokens: '41k' },
      { name: '混合精度收益评估', desc: '对比 FP32/AMP 的吞吐与显存差异', baseline: 20, withSkill: 100, latency: '11m 30s', tokens: '72k' }
    ],
    cases: [
      { title: '泄漏复现案例', prompt: '分析 train_loop_leak.py：每个 epoch 显存增长 ~200MB，定位原因并给出修复补丁。', expected: '识别出 loss history 保留了计算图（未 .detach()），补丁后显存平稳。', rubric: ['定位 detach 缺失', '补丁可运行', '显存增长 < 5MB/epoch'] }
    ]
  },
  'hf-hub-connector': {
    verified: true,
    lastRun: '2026-08-02',
    model: 'Claude Sonnet 4.5',
    harness: 'SciForge Harness v2.3.1 (Qoder)',
    runsPerTask: 5,
    aggregate: { passRate: 100, baseline: 40 },
    tasks: [
      { name: '权重下载与校验', desc: '拉取指定模型权重并校验 SHA256 完整性', baseline: 60, withSkill: 100, latency: '视带宽', tokens: '12k' },
      { name: '量化版本选择', desc: '按显存预算推荐并下载 AWQ/GGUF 量化版本', baseline: 20, withSkill: 100, latency: '视带宽', tokens: '16k' },
      { name: '断点续传恢复', desc: '下载中断后从断点恢复而非重新下载', baseline: 40, withSkill: 100, latency: '视带宽', tokens: '13k' }
    ],
    cases: [
      { title: '7B 模型拉取', prompt: '下载 Qwen2.5-7B-Instruct 的 AWQ 4-bit 版本，校验后加载一次 forward 测试。', expected: 'safetensors 全部下载，SHA 校验通过，forward 输出 logits 形状正确。', rubric: ['SHA256 校验通过', 'forward 正常', '显存占用 ≤ 6GB'] }
    ]
  },
  'qiskit-circuit-sim': {
    verified: true,
    lastRun: '2026-07-26',
    model: 'Claude Sonnet 4.5',
    harness: 'SciForge Harness v2.3.1 (Claude Desktop)',
    runsPerTask: 5,
    aggregate: { passRate: 100, baseline: 40 },
    tasks: [
      { name: 'Bell 态制备验证', desc: '构建 H+CNOT 电路并验证态矢量与理论解一致', baseline: 40, withSkill: 100, latency: '1m 05s', tokens: '11k' },
      { name: '含噪声测量模拟', desc: '加入 depolarizing 噪声通道模拟 1024 shots 分布', baseline: 40, withSkill: 100, latency: '1m 40s', tokens: '14k' },
      { name: '电路深度优化', desc: '对给定电路执行 transpile 优化并报告深度变化', baseline: 40, withSkill: 100, latency: '1m 20s', tokens: '12k' }
    ],
    cases: [
      { title: 'Bell 态数值校验', prompt: '制备 |Φ+⟩ Bell 态，输出态矢量与 1024 shots 测量概率。', expected: '态矢量 ≈ (|00⟩+|11⟩)/√2，测量中 00/11 各约 50%，01/10 ≈ 0。', rubric: ['态矢量保真度 > 0.999', '00+11 占比 > 99%', '电路深度 = 2'] }
    ]
  }
};

export const getBenchByToolId = (toolId) => benchRegistry[toolId] || null;

// Leaderboard ranking: aggregate pass rate desc, then baseline lift desc
export const getBenchRanking = () => {
  const rows = [];
  disciplinesData.forEach(discipline => {
    discipline.subcategories.forEach(sub => {
      sub.items.forEach(tool => {
        if (!benchRegistry[tool.id]) return;
        rows.push({
          tool: { ...tool, disciplineId: discipline.id, subcategoryId: sub.id },
          discipline,
          bench: benchRegistry[tool.id],
          lift: benchRegistry[tool.id].aggregate.passRate - benchRegistry[tool.id].aggregate.baseline
        });
      });
    });
  });
  return rows.sort((a, b) =>
    b.bench.aggregate.passRate - a.bench.aggregate.passRate || b.lift - a.lift
  );
};

export const disciplinesData = [
  {
    id: 'biology',
    title: '生物医学与生命科学',
    description: '深度探索基因组数据、单细胞测序、蛋白质三维结构及药理学临床数据。',
    icon: '🧬',
    subcategories: [
      {
        id: 'single-cell',
        title: '单细胞 (Single-Cell)',
        description: '单细胞转录组、表观组数据分析及细胞类型注释工具。',
        items: [
          {
            id: 'seurat-sc-pipeline',
            title: 'Seurat 单细胞分析管线',
            description: '自动执行 QC 过滤、PCA 降维、UMAP 聚类与 Marker 基因识别。',
            type: 'Skill',
            icon: '🧫',
            author: 'Satija Lab',
            downloads: '1.2M',
            rating: '4.9',
            tags: ['单细胞', 'RNA-seq', 'UMAP', 'Seurat'],
            skillbench: 4.9,
            metrics: { usability: 96, robustness: 94, safety: 98 },
            installedBy: '84,200 users',
            lastEvolved: '3 天前',
            githubStars: '15,420',
            repo: 'satijalab/seurat-agent-skill',
            license: 'GPL-3.0',
            installCmds: {
              zip: 'curl -fsSL https://sciforge.ai/api/v1/skills/seurat-sc-pipeline.zip -o seurat.zip && unzip seurat.zip',
              agent: 'sciforge install skill satijalab/seurat-sc-pipeline',
              cli: 'npx @sciforge/cli add skill:seurat-sc-pipeline'
            },
            authorId: 'satija-lab',
            credit: {
              doi: '10.5281/zenodo.14820001',
              citations: 128,
              papers: [
                { title: 'A multimodal single-cell atlas of the human immune response', venue: 'Nature Methods', year: 2026 },
                { title: 'Batch-corrected integration of 2.1M single-cell transcriptomes', venue: 'Genome Biology', year: 2026 }
              ]
            },
            compat: {
              hosts: [
                { name: 'Claude Desktop', status: 'yes' },
                { name: 'Cursor', status: 'yes' },
                { name: 'Qoder', status: 'yes' },
                { name: 'Cline', status: 'yes' }
              ],
              os: { windows: true, macos: true, linux: true },
              runtime: 'R ≥ 4.3',
              gpu: 'none',
              permissions: [
                '本地文件读写 (输入矩阵 / 输出 RDS)',
                '网络访问 (首次运行自动安装 R 依赖包)'
              ],
              dependencies: ['Seurat ≥ 5.0', 'dplyr', 'Matrix']
            },
            fileTree: [
              { name: 'SKILL.md', type: 'file' },
              { name: 'scripts/run_seurat.R', type: 'file' },
              { name: 'scripts/qc_filter.py', type: 'file' },
              { name: 'templates/umap_config.yaml', type: 'file' }
            ],
            evolutionHistory: [
              { version: 'v2.1.0', date: '2026-08-01', notes: '优化了对 10x Genomics Flex 数据的降维算法，SkillsBench 提分 +4.2%' },
              { version: 'v2.0.4', date: '2026-06-15', notes: '修复双细胞过滤模块的内存溢出问题' },
              { version: 'v1.0.0', date: '2026-01-10', notes: '初始版本发布' }
            ],
            sourceCode: `# Seurat Single-Cell Pipeline Skill

Use this skill when performing quality control, normalization, feature selection, dimensionality reduction (PCA/UMAP), and marker gene identification for single-cell RNA-seq datasets.

## Agent Action Rules
1. Check output file directory before running Rscript
2. Enforce minimum cell cutoffs (>200 genes/cell, <10% mitochondrial reads)
3. Generate high-resolution PDF plots for UMAP clusters

\`\`\`r
library(Seurat)
library(dplyr)

run_pipeline <- function(matrix_dir, out_dir) {
  scdata <- Read10X(data.dir = matrix_dir)
  seurat_obj <- CreateSeuratObject(counts = scdata, project = "SciForge_SC", min.cells = 3, min.features = 200)
  seurat_obj[["percent.mt"]] <- PercentageFeatureSet(seurat_obj, pattern = "^MT-")
  seurat_obj <- subset(seurat_obj, subset = nFeature_RNA > 200 & nFeature_RNA < 6000 & percent.mt < 10)
  seurat_obj <- NormalizeData(seurat_obj) %>% FindVariableFeatures() %>% ScaleData() %>% RunPCA() %>% RunUMAP(dims = 1:30)
  saveRDS(seurat_obj, file.path(out_dir, "seurat_final.rds"))
}
\`\`\`
`
          },
          {
            id: 'celltypist-annotator',
            title: 'CellTypist 自动细胞注释',
            description: '基于机器学习模型的免疫与组织细胞类型超高速精准标注。',
            type: 'Plugin',
            icon: '🩸',
            author: 'Teichmann Lab',
            downloads: '680k',
            rating: '4.8',
            tags: ['细胞注释', '免疫学', '机器学习'],
            skillbench: 4.7,
            metrics: { usability: 92, robustness: 90, safety: 95 },
            installedBy: '32,150 users',
            lastEvolved: '1 周前',
            githubStars: '6,890',
            repo: 'teichlab/celltypist-agent',
            license: 'MIT',
            installCmds: {
              zip: 'curl -fsSL https://sciforge.ai/api/v1/plugins/celltypist-annotator.zip -o celltypist.zip',
              agent: 'sciforge install plugin teichlab/celltypist-annotator',
              cli: 'pip install sciforge-plugin-celltypist'
            },
            authorId: 'teichmann-lab',
            credit: {
              doi: '10.5281/zenodo.14820002',
              citations: 76,
              papers: [
                { title: 'Tumor microenvironment cell atlas across 12 cancer types', venue: 'Cancer Cell', year: 2026 }
              ]
            },
            compat: {
              hosts: [
                { name: 'Claude Desktop', status: 'yes' },
                { name: 'Cursor', status: 'yes' },
                { name: 'Qoder', status: 'yes' },
                { name: 'Cline', status: 'partial' }
              ],
              os: { windows: true, macos: true, linux: true },
              runtime: 'Python ≥ 3.9',
              gpu: 'optional',
              permissions: [
                '本地文件读写 (注释结果写入 adata)',
                '网络访问 (自动下载预训练分类模型, 约 300MB)'
              ],
              dependencies: ['celltypist ≥ 1.6', 'scanpy ≥ 1.9', 'scikit-learn']
            },
            fileTree: [
              { name: 'plugin.json', type: 'file' },
              { name: 'celltypist_runner.py', type: 'file' },
              { name: 'models/Immune_All_Low.pkl', type: 'file' }
            ],
            evolutionHistory: [
              { version: 'v1.4.0', date: '2026-07-20', notes: '新增人类肿瘤微环境专用模型，注释准确率达 96.8%' }
            ],
            sourceCode: `# CellTypist Automatic Cell Type Annotator

This plugin provides automated, cross-tissue cell type annotation for single-cell transcriptomics.

## Quick Python API
\`\`\`python
import celltypist
from celltypist import models

# Load model and predict
predictions = celltypist.annotate(adata, model='Immune_All_Low.pkl', majority_voting=True)
adata = predictions.to_adata()
\`\`\`
`
          }
        ]
      },
      {
        id: 'multi-omics',
        title: '多组学 (Multi-Omics)',
        description: '跨平台联合分析基因组、转录组与代谢组数据。',
        items: [
          {
            id: 'mofa-integration',
            title: 'MOFA+ 多组学因子分析',
            description: '整合 RNA-seq、ATAC-seq 和 DNA 甲基化数据的非监督多组学建模。',
            type: 'Skill',
            icon: '🧬',
            author: 'EMBL Genomics',
            downloads: '510k',
            rating: '4.8',
            tags: ['多组学', 'ATAC-seq', '表观遗传', 'MOFA'],
            skillbench: 4.8,
            metrics: { usability: 88, robustness: 92, safety: 96 },
            installedBy: '19,400 users',
            lastEvolved: '2 周前',
            githubStars: '4,520',
            repo: 'bioINVENT/mofa-agent',
            license: 'MIT',
            installCmds: {
              zip: 'curl -fsSL https://sciforge.ai/api/v1/skills/mofa-integration.zip -o mofa.zip',
              agent: 'sciforge install skill bioINVENT/mofa-integration',
              cli: 'npx @sciforge/cli add skill:mofa-integration'
            },
            authorId: 'embl-genomics',
            credit: {
              doi: '10.5281/zenodo.14820003',
              citations: 41,
              papers: []
            },
            compat: {
              hosts: [
                { name: 'Claude Desktop', status: 'yes' },
                { name: 'Cursor', status: 'yes' },
                { name: 'Qoder', status: 'yes' },
                { name: 'Cline', status: 'yes' }
              ],
              os: { windows: false, macos: true, linux: true },
              runtime: 'Python ≥ 3.9',
              gpu: 'optional',
              permissions: [
                '本地文件读写 (多组学输入矩阵 / 因子输出)'
              ],
              dependencies: ['mofapy2 ≥ 1.6', 'anndata', 'pandas']
            },
            fileTree: [
              { name: 'SKILL.md', type: 'file' },
              { name: 'fit_mofa.py', type: 'file' }
            ],
            evolutionHistory: [
              { version: 'v1.2.0', date: '2026-07-10', notes: '支持 GPU 加速推断' }
            ],
            sourceCode: `# MOFA+ Multi-Omics Factor Analysis

Use this skill when combining transcriptomic, epigenomic, and proteomic assays from matched samples.
`
          },
          {
            id: 'cite-seq-demux',
            title: 'CITE-seq 蛋白与抗体解拆',
            description: '自动解析表面蛋白抗体寡核苷酸标签 (ADT) 与细胞条形码。',
            type: 'MCP',
            icon: '🔬',
            author: 'NY Genome Center',
            downloads: '390k',
            rating: '4.7',
            tags: ['CITE-seq', '表面蛋白', 'ADT'],
            skillbench: 4.6,
            metrics: { usability: 86, robustness: 89, safety: 94 },
            installedBy: '14,200 users',
            lastEvolved: '1 个月前',
            githubStars: '3,210',
            repo: 'nygc/citeseq-mcp',
            license: 'Apache 2.0',
            installCmds: {
              zip: 'curl -fsSL https://sciforge.ai/api/v1/mcps/cite-seq-demux.zip -o cite.zip',
              agent: 'sciforge install mcp nygc/cite-seq-demux',
              cli: 'npx @sciforge/cli add mcp:cite-seq-demux'
            },
            authorId: 'nygc',
            credit: {
              doi: '10.5281/zenodo.14820004',
              citations: 18,
              papers: []
            },
            compat: {
              hosts: [
                { name: 'Claude Desktop', status: 'yes' },
                { name: 'Cursor', status: 'yes' },
                { name: 'Qoder', status: 'yes' },
                { name: 'Cline', status: 'yes' }
              ],
              os: { windows: true, macos: true, linux: true },
              runtime: 'Python ≥ 3.10',
              gpu: 'none',
              permissions: [
                '本地文件读写 (FASTQ / 计数矩阵)',
                '本地进程启动 (stdio MCP 传输)'
              ],
              dependencies: ['pandas ≥ 2.0', 'numpy']
            },
            fileTree: [
              { name: 'mcp_config.json', type: 'file' },
              { name: 'demux.py', type: 'file' }
            ],
            evolutionHistory: [
              { version: 'v1.0.1', date: '2026-05-01', notes: '修复制表过程中的空值报错' }
            ],
            sourceCode: `# CITE-seq Demultiplexing MCP Protocol
`
          }
        ]
      },
      {
        id: 'pharmacology',
        title: '药理学 (Pharmacology)',
        description: '药物靶向预测、ADMET 属性分析及小分子对接筛选。',
        items: [
          {
            id: 'opentargets-query',
            title: 'OpenTargets 靶点发现引擎',
            description: '查询 Open Targets 平台以获取靶点与疾病关联及药物靶点发现。',
            type: 'Skill',
            icon: '💊',
            author: 'EMBL-EBI',
            downloads: '950k',
            rating: '4.9',
            tags: ['药物发现', '疾病靶点', '生物信息学'],
            skillbench: 4.9,
            metrics: { usability: 94, robustness: 92, safety: 98 },
            installedBy: '42,045 users',
            lastEvolved: '2 周前',
            githubStars: '12,504',
            repo: 'opentargets/platform-skill',
            license: 'Apache 2.0',
            installCmds: {
              zip: 'curl -fsSL https://sciforge.ai/api/v1/skills/opentargets-query.zip -o opentargets.zip',
              agent: 'sciforge install skill opentargets/platform-skill',
              cli: 'npx @sciforge/cli add skill:opentargets-query'
            },
            authorId: 'embl-ebi',
            credit: {
              doi: '10.5281/zenodo.14820005',
              citations: 96,
              papers: [
                { title: 'Systematic target prioritization for rare diseases', venue: 'Nature Genetics', year: 2026 }
              ]
            },
            compat: {
              hosts: [
                { name: 'Claude Desktop', status: 'yes' },
                { name: 'Cursor', status: 'yes' },
                { name: 'Qoder', status: 'yes' },
                { name: 'Cline', status: 'yes' }
              ],
              os: { windows: true, macos: true, linux: true },
              runtime: 'Python ≥ 3.9',
              gpu: 'none',
              permissions: [
                '网络访问 (Open Targets GraphQL API, 无需 API Key)'
              ],
              dependencies: ['requests ≥ 2.31']
            },
            fileTree: [
              { name: 'SKILL.md', type: 'file' },
              { name: 'query_graphql.py', type: 'file' },
              { name: 'schemas/target_disease.graphql', type: 'file' }
            ],
            evolutionHistory: [
              { version: 'v3.2.0', date: '2026-07-28', notes: '升级 GraphQL API 至 v24.06 数据源，增加遗传学学证据评分细分' },
              { version: 'v3.0.0', date: '2026-03-12', notes: '支持 Agent 端对靶点可药性 (Tractability) 评分自动排序' }
            ],
            sourceCode: `# OpenTargets Target-Disease Association Skill

Use this skill when looking up validated disease target evidence, GWAS variants, approved drug indications, and tractability scores.

\`\`\`python
import requests

GRAPHQL_URL = "https://api.platform.opentargets.org/api/v4/graphql"

def get_target_associations(gene_symbol):
    query = """
    query TargetAssociations($symbol: String!) {
      target(ensemblId: $symbol) {
        id
        approvedSymbol
        associatedDiseases {
          rows {
            disease { id name }
            score
          }
        }
      }
    }
    """
    res = requests.post(GRAPHQL_URL, json={'query': query, 'variables': {'symbol': gene_symbol}})
    return res.json()
\`\`\`
`
          },
          {
            id: 'autodock-vina-runner',
            title: 'AutoDock Vina 分子对接',
            description: '受体-配体结合亲和力估算与构象采样自动化。',
            type: 'Plugin',
            icon: '🧪',
            author: 'Scripps Research',
            downloads: '780k',
            rating: '4.8',
            tags: ['分子对接', '虚拟筛选', '配体 binding'],
            skillbench: 4.8,
            metrics: { usability: 90, robustness: 93, safety: 96 },
            installedBy: '35,100 users',
            lastEvolved: '5 天前',
            githubStars: '9,840',
            repo: 'scripps/vina-agent-plugin',
            license: 'Apache 2.0',
            installCmds: {
              zip: 'curl -fsSL https://sciforge.ai/api/v1/plugins/autodock-vina-runner.zip -o vina.zip',
              agent: 'sciforge install plugin scripps/autodock-vina-runner',
              cli: 'npx @sciforge/cli add plugin:autodock-vina-runner'
            },
            authorId: 'scripps',
            credit: {
              doi: '10.5281/zenodo.14820006',
              citations: 88,
              papers: [
                { title: 'Structure-guided discovery of selective KRAS inhibitors', venue: 'Journal of Medicinal Chemistry', year: 2026 }
              ]
            },
            compat: {
              hosts: [
                { name: 'Claude Desktop', status: 'yes' },
                { name: 'Cursor', status: 'yes' },
                { name: 'Qoder', status: 'yes' },
                { name: 'Cline', status: 'yes' }
              ],
              os: { windows: true, macos: true, linux: true },
              runtime: 'Python ≥ 3.9',
              gpu: 'optional',
              permissions: [
                '本地文件读写 (PDBQT 配体与受体文件)',
                '本地进程启动 (调用 AutoDock Vina 可执行文件)'
              ],
              dependencies: ['AutoDock Vina ≥ 1.2.5', 'meeko', 'openbabel']
            },
            fileTree: [
              { name: 'plugin.json', type: 'file' },
              { name: 'vina_wrapper.py', type: 'file' },
              { name: 'config/vina_box.cfg', type: 'file' }
            ],
            evolutionHistory: [
              { version: 'v2.0.1', date: '2026-08-01', notes: '自动识别结合口袋 (Binding Pocket) 坐标，无需手动指定 grid box' }
            ],
            sourceCode: `# AutoDock Vina Molecular Docking Plugin

Automates grid box generation, PDBQT ligand preparation, Vina execution, and binding energy (kcal/mol) extraction.
`
          }
        ]
      },
      {
        id: 'proteomics',
        title: '蛋白质 (Proteomics)',
        description: '蛋白质折叠预测、结构对比分析与互作网络构建。',
        items: [
          {
            id: 'alphafold-db-api',
            title: 'AlphaFold 结构检索与 pLDDT 分析',
            description: '通过 UniProt 编号极速提取 AlphaFold2/3 预测结构并评测局部置信度。',
            type: 'Skill',
            icon: '🧬',
            author: 'DeepMind',
            downloads: '1.8M',
            rating: '4.95',
            tags: ['蛋白质', 'AlphaFold', 'pLDDT', '结构生物学'],
            skillbench: 4.95,
            metrics: { usability: 98, robustness: 96, safety: 99 },
            installedBy: '98,400 users',
            lastEvolved: '昨天',
            githubStars: '28,900',
            repo: 'deepmind/alphafold-skill',
            license: 'Apache 2.0',
            installCmds: {
              zip: 'curl -fsSL https://sciforge.ai/api/v1/skills/alphafold-db-api.zip -o af_db.zip',
              agent: 'sciforge install skill deepmind/alphafold-skill',
              cli: 'npx @sciforge/cli add skill:alphafold-db-api'
            },
            authorId: 'deepmind',
            credit: {
              doi: '10.5281/zenodo.14820007',
              citations: 215,
              papers: [
                { title: 'Structural basis of orphan receptor ligand recognition', venue: 'Cell', year: 2026 },
                { title: 'High-throughput screening of disordered protein conformations', venue: 'Nature Structural & Molecular Biology', year: 2026 }
              ]
            },
            compat: {
              hosts: [
                { name: 'Claude Desktop', status: 'yes' },
                { name: 'Cursor', status: 'yes' },
                { name: 'Qoder', status: 'yes' },
                { name: 'Cline', status: 'yes' }
              ],
              os: { windows: true, macos: true, linux: true },
              runtime: 'Python ≥ 3.9',
              gpu: 'none',
              permissions: [
                '网络访问 (AlphaFold DB / UniProt API, 无需 API Key)',
                '本地文件读写 (缓存 CIF / PDB 结构文件)'
              ],
              dependencies: ['requests ≥ 2.31', 'biopython ≥ 1.83']
            },
            fileTree: [
              { name: 'SKILL.md', type: 'file' },
              { name: 'fetch_pdb.py', type: 'file' },
              { name: 'plddt_analyzer.py', type: 'file' }
            ],
            evolutionHistory: [
              { version: 'v3.1.0', date: '2026-08-05', notes: '整合 AlphaFold3 官方 PDB CIF 解析标准，识别无序区 (IDR) 精度提至 99%' },
              { version: 'v3.0.0', date: '2026-05-18', notes: '增加对多体复合物 (Multimer) 结构的直接提取支持' }
            ],
            sourceCode: `# AlphaFold Structural Analysis Skill

Use this skill when fetching 3D structures via UniProt ID, evaluating residue-level pLDDT confidence scores, or masking low-confidence disordered regions.

\`\`\`python
import requests

def fetch_alphafold_cif(uniprot_id):
    url = f"https://alphafold.ebi.ac.uk/api/prediction/{uniprot_id}"
    res = requests.get(url).json()
    if res:
        cif_url = res[0]['cifUrl']
        bcif_url = res[0]['bcifUrl']
        plddt_summary = res[0]['globalMetricValue']
        return {'cif': cif_url, 'mean_plddt': plddt_summary}
    return None
\`\`\`
`
          },
          {
            id: 'string-db-ppi',
            title: 'STRING 蛋白质相互作用网络',
            description: '提取蛋白-蛋白互作 (PPI) 关系网、结合置信度及 GO/KEGG 富集。',
            type: 'MCP',
            icon: '🕸️',
            author: 'CPR / EMBL',
            downloads: '820k',
            rating: '4.8',
            tags: ['PPI网络', 'STRING', '通路富集'],
            skillbench: 4.75,
            metrics: { usability: 91, robustness: 90, safety: 95 },
            installedBy: '39,120 users',
            lastEvolved: '2 周前',
            githubStars: '7,430',
            repo: 'string-db/mcp-server',
            license: 'MIT',
            installCmds: {
              zip: 'curl -fsSL https://sciforge.ai/api/v1/mcps/string-db-ppi.zip -o string.zip',
              agent: 'sciforge install mcp string-db/mcp-server',
              cli: 'npx @sciforge/cli add mcp:string-db-ppi'
            },
            authorId: 'cpr-embl',
            credit: {
              doi: '10.5281/zenodo.14820008',
              citations: 63,
              papers: []
            },
            compat: {
              hosts: [
                { name: 'Claude Desktop', status: 'yes' },
                { name: 'Cursor', status: 'yes' },
                { name: 'Qoder', status: 'yes' },
                { name: 'Cline', status: 'yes' }
              ],
              os: { windows: true, macos: true, linux: true },
              runtime: 'Python ≥ 3.10',
              gpu: 'none',
              permissions: [
                '网络访问 (STRING REST API, 高频查询需注册免费 Key)',
                '本地进程启动 (stdio MCP 传输)'
              ],
              dependencies: ['requests ≥ 2.31', 'networkx']
            },
            fileTree: [
              { name: 'mcp_config.json', type: 'file' },
              { name: 'ppi_query.py', type: 'file' }
            ],
            evolutionHistory: [
              { version: 'v1.5.0', date: '2026-07-15', notes: '支持导出 Cytoscape 格式的 JSON 关系拓扑图' }
            ],
            sourceCode: `# STRING PPI Network MCP Server
`
          }
        ]
      }
    ]
  },
  {
    id: 'computer-science',
    title: '计算机科学与人工智能',
    description: '涵盖机器学习、深度学习推理、算法分析以及软件工程相关的 Agent 工具。',
    icon: '💻',
    subcategories: [
      {
        id: 'ml',
        title: '机器学习与大模型 (ML & LLM)',
        description: '各类大模型推理、剪枝压缩及模型架构分析工具。',
        items: [
          {
            id: 'pytorch-model-profiler',
            title: 'PyTorch 模型算力与显存剖析器',
            description: '自动解析 PyTorch 神经元架构、FLOPs 计算量与 GPU 显存泄漏隐患。',
            type: 'Skill',
            icon: '🔥',
            author: 'Meta AI',
            downloads: '2.1M',
            rating: '4.92',
            tags: ['PyTorch', 'FLOPs', 'CUDA', '性能优化'],
            skillbench: 4.9,
            metrics: { usability: 96, robustness: 95, safety: 97 },
            installedBy: '112,000 users',
            lastEvolved: '4 天前',
            githubStars: '21,300',
            repo: 'pytorch/agent-profiler',
            license: 'BSD-3-Clause',
            installCmds: {
              zip: 'curl -fsSL https://sciforge.ai/api/v1/skills/pytorch-model-profiler.zip -o pt_prof.zip',
              agent: 'sciforge install skill pytorch/agent-profiler',
              cli: 'npx @sciforge/cli add skill:pytorch-model-profiler'
            },
            authorId: 'meta-ai',
            credit: {
              doi: '10.5281/zenodo.14820009',
              citations: 37,
              papers: []
            },
            compat: {
              hosts: [
                { name: 'Claude Desktop', status: 'yes' },
                { name: 'Cursor', status: 'yes' },
                { name: 'Qoder', status: 'yes' },
                { name: 'Cline', status: 'partial' }
              ],
              os: { windows: false, macos: false, linux: true },
              runtime: 'Python ≥ 3.10 + CUDA ≥ 12.1',
              gpu: 'required',
              permissions: [
                'GPU 设备访问 (CUDA Profiler 与显存采样)',
                '本地文件读写 (性能报告输出)'
              ],
              dependencies: ['torch ≥ 2.3', 'nvidia-ml-py', 'fvcore']
            },
            fileTree: [
              { name: 'SKILL.md', type: 'file' },
              { name: 'profiler.py', type: 'file' }
            ],
            evolutionHistory: [
              { version: 'v2.4.0', date: '2026-08-02', notes: '新增 Transformer FlashAttention-3 算子耗时诊断' }
            ],
            sourceCode: `# PyTorch Model Architecture Profiler

Automates FLOPs count, CUDA memory allocation tracking, and bottleneck identification.

\`\`\`python
import torch
from torch.profiler import profile, record_function, ProfilerActivity

def profile_model(model, dummy_input):
    with profile(activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA], record_shapes=True) as prof:
        with record_function("model_inference"):
            model(dummy_input)
    print(prof.key_averages().table(sort_by="cuda_time_total", row_limit=10))
\`\`\`
`
          },
          {
            id: 'hf-hub-connector',
            title: 'HuggingFace Hub 极速模型镜像源',
            description: 'Agent 端快速校验、下载并量化 HuggingFace 权重文件。',
            type: 'Plugin',
            icon: '🤗',
            author: 'HuggingFace',
            downloads: '3.4M',
            rating: '4.88',
            tags: ['HuggingFace', 'LLM', 'GGUF', '模型下载'],
            skillbench: 4.85,
            metrics: { usability: 95, robustness: 94, safety: 96 },
            installedBy: '154,000 users',
            lastEvolved: '3 天前',
            githubStars: '34,100',
            repo: 'huggingface/hub-agent-plugin',
            license: 'Apache 2.0',
            installCmds: {
              zip: 'curl -fsSL https://sciforge.ai/api/v1/plugins/hf-hub-connector.zip -o hf.zip',
              agent: 'sciforge install plugin huggingface/hub-agent-plugin',
              cli: 'pip install sciforge-hf-plugin'
            },
            authorId: 'huggingface',
            credit: {
              doi: '10.5281/zenodo.14820010',
              citations: 52,
              papers: []
            },
            compat: {
              hosts: [
                { name: 'Claude Desktop', status: 'yes' },
                { name: 'Cursor', status: 'yes' },
                { name: 'Qoder', status: 'yes' },
                { name: 'Cline', status: 'yes' }
              ],
              os: { windows: true, macos: true, linux: true },
              runtime: 'Python ≥ 3.9',
              gpu: 'none',
              permissions: [
                '网络访问 (HuggingFace Hub 下载, 门控模型需 HF Token)',
                '本地文件读写 (权重缓存目录, 可达数十 GB)',
                '环境变量读取 (HF_TOKEN / HF_HOME)'
              ],
              dependencies: ['huggingface-hub ≥ 0.24', 'safetensors']
            },
            fileTree: [
              { name: 'plugin.json', type: 'file' },
              { name: 'download_quant.py', type: 'file' }
            ],
            evolutionHistory: [
              { version: 'v1.8.0', date: '2026-08-03', notes: '支持断点续传与 AWQ 4-bit 量化校验' }
            ],
            sourceCode: `# HuggingFace Agent Connector Plugin
`
          }
        ]
      }
    ]
  },
  {
    id: 'physics',
    title: '物理学与天文学',
    description: '天体物理数据分析、量子力学模拟以及高能粒子物理工具集。',
    icon: '⚛️',
    subcategories: [
      {
        id: 'quantum',
        title: '量子计算 (Quantum Computing)',
        description: '模拟小规模量子电路并可视化状态向量。',
        items: [
          {
            id: 'qiskit-circuit-sim',
            title: 'Qiskit 量子电路分析与态矢量模拟',
            description: '自动构建量子门阵列、求解薛定谔方程与计算测量概率分布。',
            type: 'Plugin',
            icon: '⚛️',
            author: 'IBM Quantum',
            downloads: '420k',
            rating: '4.85',
            tags: ['量子计算', 'Qiskit', '量子叠加', '纠缠态'],
            skillbench: 4.8,
            metrics: { usability: 90, robustness: 94, safety: 97 },
            installedBy: '18,500 users',
            lastEvolved: '2 周前',
            githubStars: '11,200',
            repo: 'qiskit/quantum-agent-plugin',
            license: 'Apache 2.0',
            installCmds: {
              zip: 'curl -fsSL https://sciforge.ai/api/v1/plugins/qiskit-circuit-sim.zip -o qiskit.zip',
              agent: 'sciforge install plugin qiskit/quantum-agent-plugin',
              cli: 'npx @sciforge/cli add plugin:qiskit-circuit-sim'
            },
            authorId: 'ibm-quantum',
            credit: {
              doi: '10.5281/zenodo.14820011',
              citations: 24,
              papers: []
            },
            compat: {
              hosts: [
                { name: 'Claude Desktop', status: 'yes' },
                { name: 'Cursor', status: 'yes' },
                { name: 'Qoder', status: 'yes' },
                { name: 'Cline', status: 'yes' }
              ],
              os: { windows: true, macos: true, linux: true },
              runtime: 'Python ≥ 3.9',
              gpu: 'none',
              permissions: [
                '本地文件读写 (电路定义 / 态矢量导出)',
                '网络访问 (可选: 提交 IBM Quantum 真实硬件任务, 需 API Token)'
              ],
              dependencies: ['qiskit ≥ 1.0', 'qiskit-aer']
            },
            fileTree: [
              { name: 'plugin.json', type: 'file' },
              { name: 'simulate_bell.py', type: 'file' }
            ],
            evolutionHistory: [
              { version: 'v2.1.0', date: '2026-07-22', notes: '支持含噪声信道 (Noise Model) 模拟' }
            ],
            sourceCode: `# Qiskit Quantum Simulator Plugin

\`\`\`python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Create Bell state
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()

sim = AerSimulator()
result = sim.run(qc).result()
counts = result.get_counts()
print(counts)
\`\`\`
`
          }
        ]
      }
    ]
  }
];

export const authorsData = [
  {
    id: 'satija-lab',
    name: 'Satija Lab',
    type: '实验室',
    affiliation: 'New York Genome Center / NYU',
    homepage: 'https://satijalab.org',
    joined: '2026 年 1 月',
    bio: '专注单细胞基因组学分析方法与开放工具开发，致力于多模态单细胞数据的可解释分析管线。'
  },
  {
    id: 'teichmann-lab',
    name: 'Teichmann Lab',
    type: '实验室',
    affiliation: 'Wellcome Sanger Institute',
    homepage: 'https://www.teichlab.org',
    joined: '2026 年 2 月',
    bio: '研究细胞分化与免疫系统图谱，开发大规模细胞注释与参考图谱构建工具。'
  },
  {
    id: 'embl-genomics',
    name: 'EMBL Genomics Unit',
    type: '机构',
    affiliation: 'European Molecular Biology Laboratory (EMBL)',
    homepage: 'https://www.embl.org',
    joined: '2026 年 3 月',
    bio: 'EMBL 基因组学平台，提供多组学整合分析与统计建模开源方法。'
  },
  {
    id: 'nygc',
    name: 'NY Genome Center',
    type: '机构',
    affiliation: 'New York Genome Center',
    homepage: 'https://www.nygenome.org',
    joined: '2026 年 3 月',
    bio: '纽约基因组中心，专注多组学测序技术开发与 CITE-seq 等多模态实验方法。'
  },
  {
    id: 'embl-ebi',
    name: 'EMBL-EBI',
    type: '机构',
    affiliation: 'European Bioinformatics Institute',
    homepage: 'https://www.ebi.ac.uk',
    joined: '2026 年 1 月',
    bio: '欧洲生物信息学研究所，维护 Open Targets 等公共科研数据平台与 API 服务。'
  },
  {
    id: 'scripps',
    name: 'Scripps Research',
    type: '机构',
    affiliation: 'Scripps Research Institute',
    homepage: 'https://www.scripps.edu',
    joined: '2026 年 2 月',
    bio: '斯克利普斯研究所，分子对接与计算化学领域标杆工具的开发方。'
  },
  {
    id: 'deepmind',
    name: 'DeepMind',
    type: '机构',
    affiliation: 'Google DeepMind',
    homepage: 'https://deepmind.google',
    joined: '2026 年 1 月',
    bio: 'AlphaFold 系列蛋白质结构预测模型的研发机构，开放结构数据库维护方。'
  },
  {
    id: 'cpr-embl',
    name: 'CPR / EMBL',
    type: '实验室',
    affiliation: 'EMBL Computational Proteomics Research',
    homepage: 'https://www.embl.org',
    joined: '2026 年 4 月',
    bio: '计算蛋白质组学研究组，维护蛋白质互作网络数据库与富集分析服务。'
  },
  {
    id: 'meta-ai',
    name: 'Meta AI',
    type: '机构',
    affiliation: 'Meta AI Research (FAIR)',
    homepage: 'https://ai.meta.com',
    joined: '2026 年 2 月',
    bio: 'Meta AI 研究院，开源深度学习框架与模型性能分析工具链的贡献方。'
  },
  {
    id: 'huggingface',
    name: 'HuggingFace',
    type: '机构',
    affiliation: 'Hugging Face Inc.',
    homepage: 'https://huggingface.co',
    joined: '2026 年 1 月',
    bio: '开源机器学习社区与模型托管平台，维护 Hub API 与模型分发基础设施。'
  },
  {
    id: 'ibm-quantum',
    name: 'IBM Quantum',
    type: '机构',
    affiliation: 'IBM Research',
    homepage: 'https://www.ibm.com/quantum',
    joined: '2026 年 5 月',
    bio: 'IBM 量子计算部门，量子电路开发框架与真实量子硬件云服务提供方。'
  }
];

export const getAllTools = () => {
  const allSubcats = disciplinesData.flatMap(d => d.subcategories);
  return allSubcats.flatMap(s => s.items);
};

export const getToolById = (id) => {
  const allTools = getAllTools();
  return allTools.find(tool => tool.id === id);
};

export const getDisciplineById = (id) => {
  return disciplinesData.find(d => d.id === id);
};

export const getAuthorById = (id) => {
  return authorsData.find(a => a.id === id);
};

export const getToolsByAuthor = (authorId) => {
  return getAllTools().filter(tool => tool.authorId === authorId);
};

export const getPipelineById = (id) => {
  return pipelineTemplates.find(p => p.id === id);
};

export const searchTools = (query, filterType = 'all', filterTag = 'all') => {
  let tools = getAllTools();
  if (filterType !== 'all') {
    tools = tools.filter(t => t.type.toLowerCase() === filterType.toLowerCase());
  }
  if (filterTag !== 'all') {
    tools = tools.filter(t => t.tags && t.tags.includes(filterTag));
  }
  if (query && query.trim() !== '') {
    const q = query.toLowerCase();
    tools = tools.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.author.toLowerCase().includes(q) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
    );
  }
  return tools;
};
