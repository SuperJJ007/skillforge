export const CATALOG_IDENTITY_VERSION = 1;

export const CANONICAL_FIELDS = Object.freeze([
  Object.freeze({ id: 'life-sciences', label: '生命科学' }),
  Object.freeze({ id: 'medicine-health', label: '医学与健康' }),
  Object.freeze({ id: 'computer-science', label: '计算机科学' }),
  Object.freeze({ id: 'mathematics-statistics', label: '数学与统计' }),
  Object.freeze({ id: 'physics-astronomy', label: '物理与天文' }),
  Object.freeze({ id: 'chemistry', label: '化学' }),
  Object.freeze({ id: 'materials-science', label: '材料科学' }),
  Object.freeze({ id: 'earth-environment', label: '地球与环境' }),
  Object.freeze({ id: 'engineering-technology', label: '工程技术' }),
  Object.freeze({ id: 'agricultural-sciences', label: '农业科学' }),
  Object.freeze({ id: 'social-sciences', label: '社会科学' }),
  Object.freeze({ id: 'humanities', label: '人文' }),
  Object.freeze({ id: 'arts', label: '艺术' }),
]);

const RESOURCE_IDENTITIES = [
  {
    id: 'e7ba68ef-b584-4432-9b89-bc08120428d6',
    slug: 'seurat-sc-pipeline',
    legacyDisciplineId: 'biology',
    authorSlug: 'satija-lab',
    scope: 'discipline',
    primaryFieldId: 'life-sciences',
    fieldIds: ['life-sciences'],
  },
  {
    id: '059bb989-b87b-483c-b592-a8f6790e4ce9',
    slug: 'celltypist-annotator',
    legacyDisciplineId: 'biology',
    authorSlug: 'teichmann-lab',
    scope: 'discipline',
    primaryFieldId: 'life-sciences',
    fieldIds: ['life-sciences', 'medicine-health'],
  },
  {
    id: '655c589d-9201-4629-9f19-29971ffb5721',
    slug: 'mofa-integration',
    legacyDisciplineId: 'biology',
    authorSlug: 'embl-genomics',
    scope: 'discipline',
    primaryFieldId: 'life-sciences',
    fieldIds: ['life-sciences'],
  },
  {
    id: '2571af80-7962-4add-85fc-5d543d081611',
    slug: 'cite-seq-demux',
    legacyDisciplineId: 'biology',
    authorSlug: 'nygc',
    scope: 'discipline',
    primaryFieldId: 'life-sciences',
    fieldIds: ['life-sciences'],
  },
  {
    id: '41222d43-e291-4d8f-9125-b7c9138135d9',
    slug: 'opentargets-query',
    legacyDisciplineId: 'biology',
    authorSlug: 'embl-ebi',
    scope: 'discipline',
    primaryFieldId: 'medicine-health',
    fieldIds: ['medicine-health', 'life-sciences'],
  },
  {
    id: '38f78a9a-ba89-4efc-b6a0-e1effa88f5b0',
    slug: 'autodock-vina-runner',
    legacyDisciplineId: 'biology',
    authorSlug: 'scripps',
    scope: 'discipline',
    primaryFieldId: 'chemistry',
    fieldIds: ['chemistry', 'medicine-health'],
  },
  {
    id: '5c7265e0-f6fc-4e84-9c97-bae559e6b555',
    slug: 'alphafold-db-api',
    legacyDisciplineId: 'biology',
    authorSlug: 'deepmind',
    scope: 'discipline',
    primaryFieldId: 'life-sciences',
    fieldIds: ['life-sciences'],
  },
  {
    id: '20b78381-09d8-42e0-8358-061c01510184',
    slug: 'string-db-ppi',
    legacyDisciplineId: 'biology',
    authorSlug: 'cpr-embl',
    scope: 'discipline',
    primaryFieldId: 'life-sciences',
    fieldIds: ['life-sciences'],
  },
  {
    id: 'fabdd2f0-545b-43a0-8ca0-6c77d10f9b23',
    slug: 'pytorch-model-profiler',
    legacyDisciplineId: 'computer-science',
    authorSlug: 'meta-ai',
    scope: 'discipline',
    primaryFieldId: 'computer-science',
    fieldIds: ['computer-science'],
  },
  {
    id: 'c6ff573b-58b0-4561-b507-9594e11e8d5d',
    slug: 'hf-hub-connector',
    legacyDisciplineId: 'computer-science',
    authorSlug: 'huggingface',
    scope: 'discipline',
    primaryFieldId: 'computer-science',
    fieldIds: ['computer-science'],
  },
  {
    id: '5f044640-5a6d-4024-8c2b-4454e5ae0955',
    slug: 'qiskit-circuit-sim',
    legacyDisciplineId: 'physics',
    authorSlug: 'ibm-quantum',
    scope: 'discipline',
    primaryFieldId: 'physics-astronomy',
    fieldIds: ['physics-astronomy', 'computer-science'],
  },
  {
    id: '823f3d34-a567-404f-b4f5-e59bea04dc9b',
    slug: 'biomcp',
    legacyDisciplineId: null,
    authorSlug: 'genomoncology',
    scope: 'discipline',
    primaryFieldId: 'medicine-health',
    fieldIds: ['medicine-health', 'life-sciences'],
  },
  {
    id: '35b6ba8c-aba2-4082-b15d-7b47e7cf8157',
    slug: 'arxiv-mcp-server',
    legacyDisciplineId: null,
    authorSlug: 'blazickjp',
    scope: 'general',
    primaryFieldId: null,
    fieldIds: [],
  },
];

const AUTHOR_IDENTITIES = [
  { id: '7db626a8-9b00-4d64-9c88-1ee1c43bb19b', slug: 'satija-lab' },
  { id: '4562f2f6-5ac1-487d-9fa8-e24ecd43fe73', slug: 'teichmann-lab' },
  { id: 'f5cc20cd-af2b-4443-bb3a-fae126495ea5', slug: 'embl-genomics' },
  { id: '8f4d6c60-e079-4706-bad9-1bb3e60af373', slug: 'nygc' },
  { id: '3332a206-26ce-4db1-a750-294d2a008856', slug: 'embl-ebi' },
  { id: 'e54743f1-9949-4557-9bf8-b3cfd386a410', slug: 'scripps' },
  { id: '894f720a-89b2-44b6-923a-88a0e2a9162f', slug: 'deepmind' },
  { id: '4d161a7f-9c14-425e-b9da-8c74e1c7f9bc', slug: 'cpr-embl' },
  { id: '7b669534-24be-4fc8-ba70-440d94c34fb5', slug: 'meta-ai' },
  { id: '47c65b6e-1774-4716-b861-a03eedb04400', slug: 'huggingface' },
  { id: '41dab36b-bbd6-4097-827e-66b016cb637f', slug: 'ibm-quantum' },
  { id: 'bb4b6fdb-6915-4ba5-b6b9-8d919a30edd0', slug: 'genomoncology' },
  { id: '14ce22a5-6cab-45d7-8a59-761ae835c24a', slug: 'blazickjp' },
];

const cloneResourceIdentity = (identity) => identity && ({
  ...identity,
  fieldIds: [...identity.fieldIds],
});

const resourcesBySlug = new Map(RESOURCE_IDENTITIES.map((identity) => [identity.slug, identity]));
const authorsBySlug = new Map(AUTHOR_IDENTITIES.map((identity) => [identity.slug, identity]));

export const listResourceIdentities = () => RESOURCE_IDENTITIES.map(cloneResourceIdentity);
export const listAuthorIdentities = () => AUTHOR_IDENTITIES.map((identity) => ({ ...identity }));
export const getResourceIdentity = (slug) => cloneResourceIdentity(resourcesBySlug.get(slug));
export const getAuthorIdentity = (slug) => {
  const identity = authorsBySlug.get(slug);
  return identity ? { ...identity } : null;
};
