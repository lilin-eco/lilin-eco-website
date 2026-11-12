import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const SITE = 'https://www.lilinst.com';
export const HASH_TAG = /<meta name="lilin-page-hash" content="[a-f0-9]{64}">/g;
export const hashHtml = html => createHash('sha256').update(html.replace(HASH_TAG, '')).digest('hex');
export const pageHash = html => html.match(/<meta name="lilin-page-hash" content="([a-f0-9]{64})">/)?.[1];

export function validateUrl(value) {
  const url = new URL(value);
  if (url.origin !== SITE || url.username || url.password || url.search || url.hash || !url.pathname.endsWith('/') ||
      url.href !== value || /%|\\/.test(url.pathname)) throw new Error('Invalid canonical page URL');
  return url;
}

export function validateManifest(manifest, commit) {
  if (manifest?.schemaVersion !== 1 || !/^[a-f0-9]{40}$/.test(manifest.commit) ||
      (commit && manifest.commit !== commit) || !Array.isArray(manifest.pages) || !manifest.pages.length) {
    throw new Error('Invalid production manifest or unexpected deployment version');
  }
  const seen = new Set();
  for (const entry of manifest.pages) {
    validateUrl(entry.url);
    if (!/^[a-f0-9]{64}$/.test(entry.hash) || seen.has(entry.url)) throw new Error('Invalid or duplicate manifest page');
    seen.add(entry.url);
  }
  return manifest;
}

export async function buildManifest(directory, commit) {
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('Build requires a Git commit SHA');
  const sitemap = await readFile(path.join(directory, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  const pages = [];
  for (const url of urls) {
    const pathname = validateUrl(url).pathname;
    const file = path.join(directory, pathname, 'index.html');
    const html = (await readFile(file, 'utf8')).replace(HASH_TAG, '');
    // Sitemap is the allowlist; also reject redirects, errors and accidental noindex entries.
    if (/name="robots"[^>]*content="[^"]*noindex/i.test(html) || /http-equiv="refresh"/i.test(html) ||
        !html.includes(`<link rel="canonical" href="${url}"`) || !html.includes('</head>')) {
      throw new Error(`Non-indexable page in sitemap: ${pathname}`);
    }
    const hash = hashHtml(html);
    await writeFile(file, html.replace('</head>', `<meta name="lilin-page-hash" content="${hash}"></head>`));
    pages.push({ url, hash });
  }
  const manifest = validateManifest({ schemaVersion: 1, commit, pages });
  await writeFile(path.join(directory, 'search-manifest.json'), JSON.stringify(manifest) + '\n');
  return manifest;
}

export function changedPages(manifest, state) {
  if (state?.schemaVersion !== 1 || !state.pages || typeof state.pages !== 'object' || Array.isArray(state.pages)) {
    throw new Error('Invalid Baidu checkpoint; refusing to reset submission history');
  }
  return manifest.pages.filter(page => state.pages[page.url] !== page.hash);
}

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export function baiduFailure(result) {
  // Emit fixed labels only, never the upstream response text or request URL.
  const message = String(result?.message ?? '').toLowerCase();
  if (/quota|limit|配额|限额/.test(message)) return 'daily-quota-exhausted';
  if (/token/.test(message)) return 'credential-rejected';
  if (/site/.test(message)) return 'site-rejected';
  if (/empty|content/.test(message)) return 'invalid-content';
  if (/not_same_site/.test(message) || result?.not_same_site?.length) return 'site-mismatch';
  if (result?.not_valid?.length) return 'invalid-url';
  return 'unclassified-api-error';
}

export async function getProductionManifest(fetcher = fetch) {
  const response = await fetcher(`${SITE}/search-manifest.json?verify=${Date.now()}`, {
    redirect: 'error', headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('Production manifest is not available');
  return validateManifest(await response.json());
}

export async function verifyPage(page, fetcher = fetch) {
  const response = await fetcher(`${page.url}?verify=${Date.now()}`, {
    redirect: 'error', headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(15000),
  });
  return response.ok && pageHash(await response.text()) === page.hash;
}

export async function waitForDeployment({ commit, latestCommit, fetcher = fetch, pause = sleep, attempts = 45 }) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (await latestCommit() !== commit) return null;
    try {
      const manifest = await getProductionManifest(fetcher);
      if (manifest.commit === commit) {
        const checks = await Promise.all(manifest.pages.map(page => verifyPage(page, fetcher)));
        if (checks.every(Boolean)) return manifest;
      }
    } catch { /* A failed build, stale CDN, or network error is never a submission signal. */ }
    if (attempt + 1 < attempts) await pause(20000);
  }
  throw new Error('Timed out waiting for this commit and its pages to be live; no URLs submitted');
}

// Submit one canonical URL per request so partial acceptance is unambiguous.
// Checkpoint each acknowledgement before proceeding to the next URL.
export async function submitChanges({ manifest, state, submit, save, stillCurrent, pause = sleep }) {
  const pending = changedPages(manifest, state);
  const currentUrls = new Set(manifest.pages.map(page => page.url));
  const next = { schemaVersion: 1, commit: manifest.commit,
    pages: Object.fromEntries(Object.entries(state.pages).filter(([url]) => currentUrls.has(url))) };
  let accepted = 0;
  for (const page of pending) {
    if (!await stillCurrent(page)) throw new Error('Production version changed; remaining URLs kept pending');
    const result = await submit(page.url);
    if (result?.error || result?.success !== 1 || result?.not_same_site?.length || result?.not_valid?.length) {
      const code = Number.isInteger(result?.error) ? result.error : 'invalid-response';
      throw new Error(`Baidu did not accept the URL (code ${code}, ${baiduFailure(result)}); remaining URLs kept pending`);
    }
    next.pages[page.url] = page.hash;
    await save(next);
    accepted++;
    console.log(`Baidu accepted ${new URL(page.url).pathname}; remaining quota: ${Number.isFinite(result.remain) ? result.remain : 'not reported'}`);
    if (accepted < pending.length) await pause(1100);
  }
  // Also prune removed URLs; a later reintroduced page must be submitted again.
  if (!pending.length) await save(next);
  return { changed: pending.length, accepted };
}
