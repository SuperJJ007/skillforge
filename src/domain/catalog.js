export const CATALOG_MODE = 'prototype-candidates';

export const FILTER_GROUPS = [
  {
    id: 'scope',
    label: '适用范围',
    options: [
      { id: 'all', label: '全部', kind: 'all' },
      { id: 'general', label: '通用科研', kind: 'scope' },
    ],
  },
  {
    id: 'disciplines',
    label: '学科领域',
    options: [
      { id: 'life-sciences', label: '生命科学', kind: 'field' },
      { id: 'medicine-health', label: '医学与健康', kind: 'field' },
      { id: 'computer-science', label: '计算机科学', kind: 'field' },
      { id: 'mathematics-statistics', label: '数学与统计', kind: 'field' },
      { id: 'physics-astronomy', label: '物理与天文', kind: 'field' },
      { id: 'chemistry', label: '化学', kind: 'field' },
      { id: 'materials-science', label: '材料科学', kind: 'field' },
      { id: 'earth-environment', label: '地球与环境', kind: 'field' },
      { id: 'engineering-technology', label: '工程技术', kind: 'field' },
      { id: 'agricultural-sciences', label: '农业科学', kind: 'field' },
      { id: 'social-sciences', label: '社会科学', kind: 'field' },
      { id: 'humanities', label: '人文', kind: 'field' },
      { id: 'arts', label: '艺术', kind: 'field' },
    ],
  },
];

export const FILTER_OPTIONS = FILTER_GROUPS.flatMap((group) => group.options);
export const FIELD_IDS = new Set(
  FILTER_OPTIONS.filter((option) => option.kind === 'field').map((option) => option.id),
);

const RESOURCE_CLASSIFICATION = {
  'seurat-sc-pipeline': { scope: 'discipline', primaryFieldId: 'life-sciences', fieldIds: ['life-sciences'] },
  'celltypist-annotator': { scope: 'discipline', primaryFieldId: 'life-sciences', fieldIds: ['life-sciences', 'medicine-health'] },
  'mofa-integration': { scope: 'discipline', primaryFieldId: 'life-sciences', fieldIds: ['life-sciences'] },
  'cite-seq-demux': { scope: 'discipline', primaryFieldId: 'life-sciences', fieldIds: ['life-sciences'] },
  'opentargets-query': { scope: 'discipline', primaryFieldId: 'medicine-health', fieldIds: ['medicine-health', 'life-sciences'] },
  'autodock-vina-runner': { scope: 'discipline', primaryFieldId: 'chemistry', fieldIds: ['chemistry', 'medicine-health'] },
  'alphafold-db-api': { scope: 'discipline', primaryFieldId: 'life-sciences', fieldIds: ['life-sciences'] },
  'string-db-ppi': { scope: 'discipline', primaryFieldId: 'life-sciences', fieldIds: ['life-sciences'] },
  'pytorch-model-profiler': { scope: 'discipline', primaryFieldId: 'computer-science', fieldIds: ['computer-science'] },
  'hf-hub-connector': { scope: 'discipline', primaryFieldId: 'computer-science', fieldIds: ['computer-science'] },
  'qiskit-circuit-sim': { scope: 'discipline', primaryFieldId: 'physics-astronomy', fieldIds: ['physics-astronomy', 'computer-science'] },
};

export const getResourceClassification = (resourceId) => {
  const classification = RESOURCE_CLASSIFICATION[resourceId];
  if (!classification) throw new Error(`Missing catalog classification for resource: ${resourceId}`);

  const { scope, primaryFieldId, fieldIds } = classification;
  if (scope === 'general') {
    if (primaryFieldId !== null || fieldIds.length !== 0) {
      throw new Error(`General resource cannot declare discipline fields: ${resourceId}`);
    }
  } else {
    const hasValidFields = scope === 'discipline'
      && FIELD_IDS.has(primaryFieldId)
      && fieldIds.includes(primaryFieldId)
      && fieldIds.every((fieldId) => FIELD_IDS.has(fieldId));
    if (!hasValidFields) throw new Error(`Invalid discipline classification for resource: ${resourceId}`);
  }

  return {
    ...classification,
    fieldIds: [...fieldIds],
  };
};

export const resourceMatchesFilter = (resource, filterId) => {
  if (filterId === 'all') return true;
  if (filterId === 'general') return resource.scope === 'general';
  return resource.scope === 'discipline' && resource.fieldIds.includes(filterId);
};

export const resourceMatchesQuery = (resource, query) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [resource.title, resource.description, resource.author, ...(resource.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(normalizedQuery);
};
