import { authorsData, disciplinesData } from '../data.js';
import { CATALOG_MODE, getResourceClassification } from '../domain/catalog.js';

const cloneResource = (resource) => ({
  ...resource,
  tags: [...resource.tags],
  fieldIds: [...resource.fieldIds],
  evidence: { ...resource.evidence },
});

const toCatalogCandidate = (resource) => ({
  id: resource.id,
  title: resource.title,
  description: resource.description,
  type: resource.type,
  icon: resource.icon,
  author: resource.author,
  authorId: resource.authorId || null,
  tags: [...(resource.tags || [])],
  ...getResourceClassification(resource.id),
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
});

const catalogCandidates = disciplinesData.flatMap((discipline) => (
  discipline.subcategories.flatMap((subcategory) => (
    subcategory.items.map(toCatalogCandidate)
  ))
));

const candidateIds = new Set(catalogCandidates.map((resource) => resource.id));
if (candidateIds.size !== catalogCandidates.length) {
  throw new Error('Local catalog contains duplicate resource IDs');
}

const candidatesById = new Map(catalogCandidates.map((resource) => [resource.id, resource]));
const authorsById = new Map(authorsData.map((author) => [author.id, author]));

const toCatalogAuthor = (author) => author && ({
  id: author.id,
  slug: author.id,
  displayName: author.name,
  entityType: author.type,
  affiliation: author.affiliation || null,
  homepageUrl: author.homepage || null,
  catalogMode: CATALOG_MODE,
  verificationState: 'candidate',
});

export class LocalResourceRepository {
  listResources() {
    return catalogCandidates.map(cloneResource);
  }

  getResourceById(resourceId) {
    const resource = candidatesById.get(resourceId);
    return resource ? cloneResource(resource) : null;
  }

  getAuthorById(authorId) {
    const author = toCatalogAuthor(authorsById.get(authorId));
    return author ? { ...author } : null;
  }

  listResourcesByAuthor(authorId) {
    return catalogCandidates
      .filter((resource) => resource.authorId === authorId)
      .map(cloneResource);
  }
}

export const localResourceRepository = new LocalResourceRepository();
