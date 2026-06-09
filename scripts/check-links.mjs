import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const SRC = path.join(ROOT, 'src');
const SCAN_DIRS = [
  'src/app',
  'src/components',
  'src/content',
  'src/contexts',
  'src/data',
  'src/navigation',
  'src/pages',
];

const EXCLUDED_PARTS = [
  `${path.sep}src${path.sep}sections${path.sep}`,
  `${path.sep}dist${path.sep}`,
  `${path.sep}node_modules${path.sep}`,
];

const ROUTE_TO_PAGE = new Map([
  ['/', 'src/pages/HomePage.tsx'],
  ['/course', 'src/pages/CoursePage.tsx'],
  ['/foundations', 'src/pages/FoundationsPage.tsx'],
  ['/ai-methods', 'src/pages/AIMethodsPage.tsx'],
  ['/frontiers', 'src/pages/FrontiersPage.tsx'],
  ['/paradigms', 'src/pages/ParadigmsPage.tsx'],
  ['/a-lab', 'src/pages/ALabPage.tsx'],
  ['/case-studio', 'src/pages/CaseStudioPage.tsx'],
  ['/sdl-demo', 'src/pages/SDLDemoPage.tsx'],
  ['/led-calibration', 'src/pages/LedCalibrationPage.tsx'],
  ['/methods', 'src/pages/MethodsPage.tsx'],
  ['/design-studio', 'src/pages/DesignStudioPage.tsx'],
  ['/resources', 'src/pages/ResourcesPage.tsx'],
]);

const GUARDED_STATUSES = new Set([401, 403, 429]);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (EXCLUDED_PARTS.some((part) => full.includes(part))) continue;
    if (entry.isDirectory()) {
      files.push(...await walk(full));
    } else if (/\.(tsx?|md|mjs|json)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function rel(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, '/');
}

function extractExternalLinks(text) {
  const links = new Set();
  const regex = /https?:\/\/[^'"`<>\s{}]+/g;
  for (const match of text.matchAll(regex)) {
    const url = match[0].replace(/[.,;:]+$/, '');
    if (url.includes('$')) continue;
    if (url === 'https://doi.org/' || url === 'http://localhost') continue;
    links.add(url);
  }
  return links;
}

function extractInternalLinks(text) {
  const links = new Set();
  const regex = /(?:href|to|route):?\s*=\s*["'](\/[^"']*)["']|(?:href|to)\s*=\s*["'](\/[^"']*)["']/g;
  for (const match of text.matchAll(regex)) {
    const value = match[1] || match[2];
    if (!value) continue;
    if (value.startsWith('//')) continue;
    if (value.startsWith('/assets/') || value.startsWith('/images/')) continue;
    links.add(value);
  }
  return links;
}

function extractIds(text) {
  const ids = new Set();
  for (const match of text.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)) {
    ids.add(match[1]);
  }
  return ids;
}

async function buildAnchorMap() {
  const anchors = new Map();
  for (const [route, page] of ROUTE_TO_PAGE.entries()) {
    const full = path.join(ROOT, page);
    try {
      anchors.set(route, extractIds(await fs.readFile(full, 'utf8')));
    } catch {
      anchors.set(route, new Set());
    }
  }
  return anchors;
}

function normalizeInternal(link) {
  const [withoutQuery] = link.split('?');
  const [routePart, hash] = withoutQuery.split('#');
  const route = routePart.replace(/\/$/, '') || '/';
  return { route, hash };
}

async function checkExternal(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'sdl-lecture-link-check/1.0' },
    });
    if ([405, 501].includes(response.status)) {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': 'sdl-lecture-link-check/1.0' },
      });
    }
    return { ok: response.status < 400 || GUARDED_STATUSES.has(response.status), status: response.status };
  } catch (error) {
    return { ok: false, status: 'ERR', error: error?.name || String(error) };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const files = (await Promise.all(SCAN_DIRS.map((dir) => walk(path.join(ROOT, dir))))).flat();
  const anchors = await buildAnchorMap();
  const internalErrors = [];
  const externalByUrl = new Map();

  for (const file of files) {
    const text = await fs.readFile(file, 'utf8');
    for (const link of extractInternalLinks(text)) {
      const { route, hash } = normalizeInternal(link);
      if (!ROUTE_TO_PAGE.has(route)) {
        internalErrors.push(`${rel(file)} -> missing route ${link}`);
        continue;
      }
      if (hash && !anchors.get(route)?.has(hash)) {
        internalErrors.push(`${rel(file)} -> missing anchor ${link}`);
      }
    }
    for (const url of extractExternalLinks(text)) {
      if (!externalByUrl.has(url)) externalByUrl.set(url, new Set());
      externalByUrl.get(url).add(rel(file));
    }
  }

  const externalResults = [];
  for (const [url, sourceFiles] of externalByUrl.entries()) {
    const result = await checkExternal(url);
    externalResults.push({ url, sourceFiles: [...sourceFiles], ...result });
  }

  const hardExternalFailures = externalResults.filter((item) => item.status === 404 || item.ok === false);
  const guarded = externalResults.filter((item) => GUARDED_STATUSES.has(item.status));

  console.log(`Scanned files: ${files.length}`);
  console.log(`Internal link errors: ${internalErrors.length}`);
  for (const error of internalErrors) console.log(`ERROR internal ${error}`);

  console.log(`External links: ${externalResults.length}`);
  for (const item of externalResults) {
    const level = item.status === 404 || item.ok === false ? 'ERROR' : GUARDED_STATUSES.has(item.status) ? 'WARN' : 'OK';
    console.log(`${level} external ${item.status} ${item.url} (${item.sourceFiles.join(', ')})`);
  }

  if (guarded.length > 0) {
    console.log('Guarded links with 401/403/429 must have DOI or official backup recorded in docs/content-audit/link-audit.md.');
  }

  if (internalErrors.length > 0 || hardExternalFailures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
