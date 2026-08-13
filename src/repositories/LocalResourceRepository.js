import { sourceCandidateAuthors, sourceCandidateResources } from '../data/sourceCandidates.js';
import { CATALOG_MODE, getResourceClassification } from '../domain/catalog.js';
import { getAuthorIdentity, getResourceIdentity } from '../domain/catalogIdentity.js';
import { cloneSourceSnapshot, validateSourceSnapshot } from '../domain/sourceSnapshot.js';

const cloneResource = (resource) => ({
  ...resource,
  tags: [...resource.tags],
  fieldIds: [...resource.fieldIds],
  evidence: { ...resource.evidence },
  ...(resource.sourceSnapshot
    ? { sourceSnapshot: cloneSourceSnapshot(resource.sourceSnapshot) }
    : {}),
});

const toSourceCandidate = (resource) => {
  const identity = getResourceIdentity(resource.slug);
  if (!identity || identity.legacyDisciplineId !== null) {
    throw new Error(`Missing source candidate identity: ${resource.slug}`);
  }
  if (identity.authorSlug !== resource.authorSlug) {
    throw new Error(`Source candidate author mismatch: ${resource.slug}`);
  }

  const authorIdentity = getAuthorIdentity(identity.authorSlug);
  if (!authorIdentity) throw new Error(`Missing source candidate author: ${identity.authorSlug}`);
  validateSourceSnapshot(resource.sourceSnapshot, resource.slug);
  if (resource.sourceSnapshot.source.canonicalUrl !== resource.sourceUrl) {
    throw new Error(`Source candidate URL mismatch: ${resource.slug}`);
  }

  return {
    id: identity.id,
    slug: identity.slug,
    title: resource.title,
    description: resource.description,
    type: resource.type,
    icon: resource.icon,
    author: resource.author,
    authorId: authorIdentity.id,
    authorSlug: authorIdentity.slug,
    tags: [...resource.tags],
    ...getResourceClassification(identity.slug),
    sourceUrl: resource.sourceUrl,
    sourceReviewState: 'source-located',
    sourceSnapshot: cloneSourceSnapshot(resource.sourceSnapshot),
    catalogMode: CATALOG_MODE,
    publicationState: 'candidate',
    evidence: {
      catalogSource: 'official-repository',
      github: 'unavailable',
      installation: 'source-documented',
      compatibility: 'unavailable',
      communityRating: 'unavailable',
      benchmark: 'unavailable',
      academicUsage: 'unavailable',
    },
  };
};

const catalogCandidates = [
  ...sourceCandidateResources.map(toSourceCandidate),
];

const candidateIds = new Set(catalogCandidates.map((resource) => resource.id));
const candidateSlugs = new Set(catalogCandidates.map((resource) => resource.slug));
if (candidateIds.size !== catalogCandidates.length || candidateSlugs.size !== catalogCandidates.length) {
  throw new Error('Local catalog contains duplicate resource identities');
}

const candidatesBySlug = new Map(catalogCandidates.map((resource) => [resource.slug, resource]));
const candidateAuthorsBySlug = new Map([
  ...sourceCandidateAuthors.map((author) => [author.slug, author]),
]);

const toCatalogAuthor = (authorSlug) => {
  const author = candidateAuthorsBySlug.get(authorSlug);
  const identity = getAuthorIdentity(authorSlug);
  if (!author || !identity) return null;

  return {
    id: identity.id,
    slug: identity.slug,
    displayName: author.name,
    entityType: author.type,
    affiliation: author.affiliation || null,
    homepageUrl: author.homepage || null,
    catalogMode: CATALOG_MODE,
    verificationState: 'candidate',
  };
};

export class LocalResourceRepository {
  listResources() {
    return catalogCandidates.map(cloneResource);
  }

  getResourceBySlug(resourceSlug) {
    const resource = candidatesBySlug.get(resourceSlug);
    return resource ? cloneResource(resource) : null;
  }

  getAuthorBySlug(authorSlug) {
    const author = toCatalogAuthor(authorSlug);
    return author ? { ...author } : null;
  }

  listResourcesByAuthorSlug(authorSlug) {
    return catalogCandidates
      .filter((resource) => resource.authorSlug === authorSlug)
      .map(cloneResource);
  }
}

export const localResourceRepository = new LocalResourceRepository();
