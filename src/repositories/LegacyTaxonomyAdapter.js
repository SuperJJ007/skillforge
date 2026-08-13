import { listAuthorIdentities, listResourceIdentities } from '../domain/catalogIdentity.js';

export const LEGACY_ROUTE_VERSION = 1;

const LEGACY_DISCIPLINE_ROUTES = Object.freeze({
  biology: {
    routeAction: 'redirect_home',
    targetPath: '/',
    notice: '旧“生物学”分类已拆分为多个学科，已返回全部资源。',
  },
  'computer-science': {
    routeAction: 'redirect_field',
    targetPath: '/?field=computer-science',
    notice: '旧学科链接已更新为首页的“计算机科学”筛选。',
  },
  physics: {
    routeAction: 'redirect_field',
    targetPath: '/?field=physics-astronomy',
    notice: '旧“物理学”链接已更新为“物理与天文”筛选。',
  },
});

export const RETIRED_ROUTE_CONTRACTS = Object.freeze([
  Object.freeze({ path: '/planner', routeAction: 'retired' }),
  Object.freeze({ path: '/bench', routeAction: 'retired' }),
]);

const PRESERVED_RESOURCE_PATHS = Object.freeze(listResourceIdentities().map((identity) => Object.freeze({
  legacyPath: `/tool/${identity.slug}`,
  pathAction: 'preserve_canonical',
  targetPath: `/tool/${identity.slug}`,
  resourceId: identity.id,
})));

const PRESERVED_AUTHOR_PATHS = Object.freeze(listAuthorIdentities().map((identity) => Object.freeze({
  legacyPath: `/author/${identity.slug}`,
  pathAction: 'preserve_canonical',
  targetPath: `/author/${identity.slug}`,
  authorId: identity.id,
})));

export class LegacyTaxonomyAdapter {
  getDisciplineRoute(legacyDisciplineId) {
    const route = LEGACY_DISCIPLINE_ROUTES[legacyDisciplineId];
    return route ? { ...route } : null;
  }

  listDisciplineRoutes() {
    return Object.entries(LEGACY_DISCIPLINE_ROUTES).map(([legacyDisciplineId, route]) => ({
      legacyDisciplineId,
      ...route,
    }));
  }

  listPreservedResourcePaths() {
    return PRESERVED_RESOURCE_PATHS.map((route) => ({ ...route }));
  }

  listPreservedAuthorPaths() {
    return PRESERVED_AUTHOR_PATHS.map((route) => ({ ...route }));
  }
}

export const legacyTaxonomyAdapter = new LegacyTaxonomyAdapter();
