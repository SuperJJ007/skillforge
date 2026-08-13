import { authorsData, disciplinesData } from '../data.js';
import { CATALOG_MODE, getResourceClassification } from '../domain/catalog.js';
import { getAuthorIdentity, getResourceIdentity } from '../domain/catalogIdentity.js';

const cloneResource = (resource) => ({
  ...resource,
  tags: [...resource.tags],
  fieldIds: [...resource.fieldIds],
  evidence: { ...resource.evidence },
});

const toCatalogCandidate = (resource, legacyDisciplineId) => {
  const identity = getResourceIdentity(resource.id);
  if (!identity) throw new Error(`Missing frozen identity for legacy resource: ${resource.id}`);
  if (identity.legacyDisciplineId !== legacyDisciplineId) {
    throw new Error(`Legacy discipline mismatch for resource: ${resource.id}`);
  }
  if (identity.authorSlug !== resource.authorId) {
    throw new Error(`Legacy author mismatch for resource: ${resource.id}`);
  }

  const authorIdentity = getAuthorIdentity(identity.authorSlug);
  if (!authorIdentity) throw new Error(`Missing frozen author identity: ${identity.authorSlug}`);

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
    tags: [...(resource.tags || [])],
    ...getResourceClassification(identity.slug),
    catalogMode: CATALOG_MODE,
    publicationState: 'candidate',
    evidence: {
      catalogSource: 'legacy-prototype',
      github: 'unavailable',
      installation: 'unavailable',
      compatibility: 'unavailable',
      communityRating: 'unavailable',
      benchmark: 'unavailable',
      academicUsage: 'unavailable',
    },
  };
};

const catalogCandidates = disciplinesData.flatMap((discipline) => (
  discipline.subcategories.flatMap((subcategory) => (
    subcategory.items.map((resource) => toCatalogCandidate(resource, discipline.id))
  ))
));

const candidateIds = new Set(catalogCandidates.map((resource) => resource.id));
const candidateSlugs = new Set(catalogCandidates.map((resource) => resource.slug));
if (candidateIds.size !== catalogCandidates.length || candidateSlugs.size !== catalogCandidates.length) {
  throw new Error('Local catalog contains duplicate resource identities');
}

const candidatesBySlug = new Map(catalogCandidates.map((resource) => [resource.slug, resource]));
const legacyAuthorsBySlug = new Map(authorsData.map((author) => [author.id, author]));

const toCatalogAuthor = (authorSlug) => {
  const author = legacyAuthorsBySlug.get(authorSlug);
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
