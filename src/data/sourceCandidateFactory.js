const freezeItems = (items) => Object.freeze(items.map((item) => Object.freeze(item)));

export const createSourceCandidate = ({
  slug,
  title,
  description,
  type,
  icon,
  author,
  authorSlug,
  tags,
  repositoryUrl,
  revision,
  revisionCommittedAt,
  fetchedAt,
  parserVersion = 'manual-first-party-v1',
  rootPath = '',
  manifestPath = '',
  project,
}) => Object.freeze({
  slug,
  title,
  description,
  type,
  icon,
  author,
  authorSlug,
  tags: Object.freeze(tags),
  sourceUrl: repositoryUrl,
  sourceSnapshot: Object.freeze({
    schemaVersion: 1,
    resourceSlug: slug,
    sourceType: 'official-repository',
    source: Object.freeze({
      provider: 'github',
      canonicalUrl: repositoryUrl,
      revision,
      revisionUrl: `${repositoryUrl}/commit/${revision}`,
      revisionCommittedAt,
      fetchedAt,
      parserVersion,
      rootPath,
      manifestPath,
    }),
    project: Object.freeze({
      declaredVersion: project.declaredVersion ?? null,
      homepageUrl: project.homepageUrl ?? repositoryUrl,
      ownerUrl: project.ownerUrl,
      ownerAvatarUrl: project.ownerAvatarUrl,
      license: Object.freeze(project.license),
      capabilities: freezeItems(project.capabilities),
      installationMethods: freezeItems(project.installationMethods),
      requirements: freezeItems(project.requirements),
      integrations: freezeItems(project.integrations),
      cautions: freezeItems(project.cautions),
    }),
  }),
});

export const createSourceAuthor = ({ slug, name, type = '机构', homepage }) => Object.freeze({
  slug,
  name,
  type,
  homepage,
});

export const sourceFact = (title, description, evidenceUrl) => ({ title, description, evidenceUrl });

export const installationFact = (title, description, command, evidenceUrl) => ({
  title,
  description,
  command,
  evidenceUrl,
});
