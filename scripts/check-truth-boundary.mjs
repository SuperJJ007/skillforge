import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
  'title',
  'description',
  'type',
  'icon',
  'author',
  'authorId',
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

if (resources.length !== 11) {
  violations.push(`expected 11 migration candidates, received ${resources.length}`);
}

for (const resource of resources) {
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

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exit(1);
}

console.log(`PASS: ${resources.length} candidates stay behind the local repository truth boundary`);
