import { CANONICAL_FIELDS, getResourceIdentity } from './catalogIdentity.js';

export const CATALOG_MODE = 'prototype-candidates';

export const FILTER_GROUPS = [
  {
    id: 'catalog',
    label: '资源分类',
    options: [
      { id: 'all', label: '全部', kind: 'all' },
      { id: 'general', label: '通用', kind: 'scope' },
      ...CANONICAL_FIELDS.map((field) => ({ ...field, kind: 'field' })),
    ],
  },
];

export const FILTER_OPTIONS = FILTER_GROUPS.flatMap((group) => group.options);
export const FIELD_IDS = new Set(
  FILTER_OPTIONS.filter((option) => option.kind === 'field').map((option) => option.id),
);

export const getResourceClassification = (resourceSlug) => {
  const identity = getResourceIdentity(resourceSlug);
  if (!identity) throw new Error(`Missing catalog identity for resource: ${resourceSlug}`);

  const { scope, primaryFieldId, fieldIds } = identity;
  if (scope === 'general') {
    if (primaryFieldId !== null || fieldIds.length !== 0) {
      throw new Error(`General resource cannot declare discipline fields: ${resourceSlug}`);
    }
  } else {
    const hasValidFields = scope === 'discipline'
      && FIELD_IDS.has(primaryFieldId)
      && fieldIds.includes(primaryFieldId)
      && fieldIds.every((fieldId) => FIELD_IDS.has(fieldId));
    if (!hasValidFields) throw new Error(`Invalid discipline classification for resource: ${resourceSlug}`);
  }

  return {
    scope,
    primaryFieldId,
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
