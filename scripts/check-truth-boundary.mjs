import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CANONICAL_FIELDS,
  CATALOG_IDENTITY_VERSION,
  listAuthorIdentities,
  listResourceIdentities,
} from '../src/domain/catalogIdentity.js';
import {
  LEGACY_ROUTE_VERSION,
  RETIRED_ROUTE_CONTRACTS,
  legacyTaxonomyAdapter,
} from '../src/repositories/LegacyTaxonomyAdapter.js';
import { catalogService } from '../src/services/catalogService.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(projectRoot, 'src');
const allowedLegacyImporter = path.join(sourceRoot, 'repositories', 'LocalResourceRepository.js');

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  }));
  return nested.flat();
};

const sourceFiles = (await walk(sourceRoot)).filter((file) => /\.(?:js|jsx)$/.test(file));
const violations = [];

for (const file of sourceFiles) {
  const source = await readFile(file, 'utf8');
  const importsLegacyFixture = /from\s+['"][^'"]*\/data(?:\.js)?['"]/.test(source);
  if (importsLegacyFixture && file !== allowedLegacyImporter) {
    violations.push(`${path.relative(projectRoot, file)} imports legacy data directly`);
  }

  if (file.includes(`${path.sep}pages${path.sep}`) && /setTimeout\s*\(/.test(source)) {
    violations.push(`${path.relative(projectRoot, file)} contains simulated delayed success`);
  }
}

const allowedResourceFields = new Set([
  'id',
  'slug',
  'title',
  'description',
  'type',
  'icon',
  'author',
  'authorId',
  'authorSlug',
  'tags',
  'scope',
  'primaryFieldId',
  'fieldIds',
  'catalogMode',
  'publicationState',
  'evidence',
]);
const forbiddenEvidenceValues = new Set(['verified', 'published', 'available']);
const resources = catalogService.listResources();
const resourceIdentities = listResourceIdentities();
const authorIdentities = listAuthorIdentities();
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const reportDuplicates = (values, label) => {
  if (new Set(values).size !== values.length) violations.push(`${label} must be unique`);
};

if (resources.length !== 11) {
  violations.push(`expected 11 migration candidates, received ${resources.length}`);
}

if (CATALOG_IDENTITY_VERSION !== 1 || LEGACY_ROUTE_VERSION !== 1) {
  violations.push('catalog identity and legacy route baselines must start at version 1');
}

if (resourceIdentities.length !== 11 || authorIdentities.length !== 11) {
  violations.push('expected 11 frozen resource identities and 11 frozen author identities');
}

if (CANONICAL_FIELDS.length !== 13) {
  violations.push(`expected 13 canonical fields, received ${CANONICAL_FIELDS.length}`);
}

reportDuplicates(resourceIdentities.map((identity) => identity.id), 'resource IDs');
reportDuplicates(resourceIdentities.map((identity) => identity.slug), 'resource slugs');
reportDuplicates(authorIdentities.map((identity) => identity.id), 'author IDs');
reportDuplicates(authorIdentities.map((identity) => identity.slug), 'author slugs');
reportDuplicates(CANONICAL_FIELDS.map((field) => field.id), 'canonical field IDs');

const resourceIdentitiesBySlug = new Map(resourceIdentities.map((identity) => [identity.slug, identity]));
const authorIdentitiesBySlug = new Map(authorIdentities.map((identity) => [identity.slug, identity]));
const canonicalFieldIds = new Set(CANONICAL_FIELDS.map((field) => field.id));

for (const identity of resourceIdentities) {
  if (!uuidPattern.test(identity.id)) violations.push(`${identity.slug} has an invalid resource UUID`);
  if (!authorIdentitiesBySlug.has(identity.authorSlug)) {
    violations.push(`${identity.slug} references an unknown author slug`);
  }

  const hasValidClassification = identity.scope === 'general'
    ? identity.primaryFieldId === null && identity.fieldIds.length === 0
    : identity.scope === 'discipline'
      && canonicalFieldIds.has(identity.primaryFieldId)
      && identity.fieldIds.includes(identity.primaryFieldId)
      && identity.fieldIds.every((fieldId) => canonicalFieldIds.has(fieldId));
  if (!hasValidClassification) violations.push(`${identity.slug} has an invalid canonical classification`);
}

for (const identity of authorIdentities) {
  if (!uuidPattern.test(identity.id)) violations.push(`${identity.slug} has an invalid author UUID`);

  const author = catalogService.getAuthor(identity.slug);
  if (!author || author.id !== identity.id || author.slug !== identity.slug) {
    violations.push(`${identity.slug} is not reachable through its canonical author URL`);
  }
}

for (const resource of resources) {
  const identity = resourceIdentitiesBySlug.get(resource.slug);
  if (!identity) {
    violations.push(`${resource.slug} is not present in the frozen identity registry`);
    continue;
  }

  if (resource.id !== identity.id || resource.authorSlug !== identity.authorSlug) {
    violations.push(`${resource.slug} does not match its frozen resource or author identity`);
  }

  if (!uuidPattern.test(resource.authorId)) {
    violations.push(`${resource.slug} exposes an invalid author UUID`);
  }

  const canonicalResource = catalogService.getResource(resource.slug);
  if (!canonicalResource || canonicalResource.id !== resource.id) {
    violations.push(`${resource.slug} is not reachable through its preserved resource URL`);
  }

  for (const field of Object.keys(resource)) {
    if (!allowedResourceFields.has(field)) {
      violations.push(`${resource.id} exposes unsupported field ${field}`);
    }
  }

  if (resource.publicationState !== 'candidate') {
    violations.push(`${resource.id} is not marked as a candidate`);
  }

  for (const [key, value] of Object.entries(resource.evidence)) {
    if (forbiddenEvidenceValues.has(value)) {
      violations.push(`${resource.id} claims unsupported ${key} evidence: ${value}`);
    }
  }
}

const legacyRoutes = legacyTaxonomyAdapter.listDisciplineRoutes();
const preservedResourcePaths = legacyTaxonomyAdapter.listPreservedResourcePaths();
const preservedAuthorPaths = legacyTaxonomyAdapter.listPreservedAuthorPaths();
const legacyDisciplineIds = new Set(resourceIdentities.map((identity) => identity.legacyDisciplineId));
reportDuplicates(legacyRoutes.map((route) => route.legacyDisciplineId), 'legacy discipline routes');
reportDuplicates(preservedResourcePaths.map((route) => route.legacyPath), 'preserved resource paths');
reportDuplicates(preservedAuthorPaths.map((route) => route.legacyPath), 'preserved author paths');

if (legacyRoutes.length !== legacyDisciplineIds.size) {
  violations.push('legacy discipline route table must exactly cover fixture disciplines');
}

if (preservedResourcePaths.length !== resourceIdentities.length) {
  violations.push('every frozen resource must have a preserved legacy path contract');
}
if (preservedAuthorPaths.length !== authorIdentities.length) {
  violations.push('every frozen author must have a preserved legacy path contract');
}

for (const route of [...preservedResourcePaths, ...preservedAuthorPaths]) {
  if (route.pathAction !== 'preserve_canonical' || route.legacyPath !== route.targetPath) {
    violations.push(`preserved path changed unexpectedly: ${route.legacyPath}`);
  }
}

for (const legacyDisciplineId of legacyDisciplineIds) {
  if (!legacyTaxonomyAdapter.getDisciplineRoute(legacyDisciplineId)) {
    violations.push(`missing legacy discipline route: ${legacyDisciplineId}`);
  }
}

const expectedLegacyRoutes = {
  biology: ['redirect_home', '/'],
  'computer-science': ['redirect_field', '/?field=computer-science'],
  physics: ['redirect_field', '/?field=physics-astronomy'],
};

for (const [legacyDisciplineId, [routeAction, targetPath]] of Object.entries(expectedLegacyRoutes)) {
  const route = legacyTaxonomyAdapter.getDisciplineRoute(legacyDisciplineId);
  if (route?.routeAction !== routeAction || route?.targetPath !== targetPath || !route.notice) {
    violations.push(`legacy route contract changed unexpectedly: ${legacyDisciplineId}`);
  }
}

const appSource = await readFile(path.join(sourceRoot, 'App.jsx'), 'utf8');
if (RETIRED_ROUTE_CONTRACTS.length !== 2) violations.push('expected exactly two retired route contracts');
for (const route of RETIRED_ROUTE_CONTRACTS) {
  if (route.routeAction !== 'retired' || !appSource.includes(`path="${route.path}"`)) {
    violations.push(`retired route is not preserved: ${route.path}`);
  }
}

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exit(1);
}

console.log(
  `PASS: ${resources.length} candidates have frozen identities, canonical classifications, and covered legacy routes`,
);
