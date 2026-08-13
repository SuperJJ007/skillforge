import {
  resourceMatchesFilter,
  resourceMatchesQuery,
} from '../domain/catalog.js';
import { localResourceRepository } from '../repositories/LocalResourceRepository.js';

export const catalogService = {
  listResources() {
    return localResourceRepository.listResources();
  },

  getResource(resourceSlug) {
    return localResourceRepository.getResourceBySlug(resourceSlug);
  },

  getAuthor(authorSlug) {
    return localResourceRepository.getAuthorBySlug(authorSlug);
  },

  listResourcesByAuthor(authorSlug) {
    return localResourceRepository.listResourcesByAuthorSlug(authorSlug);
  },

  searchResources(resources, query) {
    return resources.filter((resource) => resourceMatchesQuery(resource, query));
  },

  filterResources(resources, filterId) {
    return resources.filter((resource) => resourceMatchesFilter(resource, filterId));
  },
};
