export const SOURCE_SNAPSHOT_SCHEMA_VERSION = 1;

const SNAPSHOT_LIST_FIELDS = [
  'capabilities',
  'installationMethods',
  'requirements',
  'integrations',
  'cautions',
];

const cloneEvidenceItem = (item) => ({ ...item });

export const cloneSourceSnapshot = (snapshot) => snapshot && ({
  ...snapshot,
  source: { ...snapshot.source },
  project: {
    ...snapshot.project,
    license: { ...snapshot.project.license },
    ...Object.fromEntries(
      SNAPSHOT_LIST_FIELDS.map((field) => [
        field,
        snapshot.project[field].map(cloneEvidenceItem),
      ]),
    ),
  },
});

export const validateSourceSnapshot = (snapshot, resourceSlug) => {
  if (!snapshot || snapshot.schemaVersion !== SOURCE_SNAPSHOT_SCHEMA_VERSION) {
    throw new Error(`Invalid source snapshot schema version: ${resourceSlug}`);
  }
  if (snapshot.resourceSlug !== resourceSlug || snapshot.sourceType !== 'official-repository') {
    throw new Error(`Source snapshot identity mismatch: ${resourceSlug}`);
  }

  const { source, project } = snapshot;
  const revisionPattern = /^[0-9a-f]{40}$/;
  const canonicalRepositoryPattern = /^https:\/\/github\.com\/[^/]+\/[^/]+$/;
  if (
    source.provider !== 'github'
    || !canonicalRepositoryPattern.test(source.canonicalUrl)
    || !revisionPattern.test(source.revision)
    || source.revisionUrl !== `${source.canonicalUrl}/commit/${source.revision}`
    || Number.isNaN(Date.parse(source.revisionCommittedAt))
    || Number.isNaN(Date.parse(source.fetchedAt))
    || !source.parserVersion
  ) {
    throw new Error(`Invalid source snapshot provenance: ${resourceSlug}`);
  }

  if (!project?.license?.spdx || !project.license.name || !project.capabilities?.length) {
    throw new Error(`Incomplete source snapshot project facts: ${resourceSlug}`);
  }
  if (!project.installationMethods?.length) {
    throw new Error(`Missing source-documented installation: ${resourceSlug}`);
  }

  const evidencePrefix = `${source.canonicalUrl}/blob/${source.revision}/`;
  const evidenceItems = [
    project.license,
    ...SNAPSHOT_LIST_FIELDS.flatMap((field) => project[field]),
  ];
  if (evidenceItems.some((item) => !item.evidenceUrl?.startsWith(evidencePrefix))) {
    throw new Error(`Source snapshot evidence is not revision-bound: ${resourceSlug}`);
  }
};
