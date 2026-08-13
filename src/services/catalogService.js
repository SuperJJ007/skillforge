import {
  resourceMatchesFilter,
  resourceMatchesQuery,
} from '../domain/catalog.js';
import { localResourceRepository } from '../repositories/LocalResourceRepository.js';

export const catalogService = {
  listResources() {
    return localResourceRepository.listResources();
  },

  getResource(resourceId) {
    return localResourceRepository.getResourceById(resourceId);
  },

  getAuthor(authorId) {
    return localResourceRepository.getAuthorById(authorId);
  },

  listResourcesByAuthor(authorId) {
    return localResourceRepository.listResourcesByAuthor(authorId);
  },

  searchResources(resources, query) {
    return resources.filter((resource) => resourceMatchesQuery(resource, query));
  },

  filterResources(resources, filterId) {
    return resources.filter((resource) => resourceMatchesFilter(resource, filterId));
  },
};
