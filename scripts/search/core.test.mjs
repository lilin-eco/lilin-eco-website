import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { SITE, buildManifest, hashHtml, pageHash, validateManifest, changedPages, waitForDeployment, submitChanges } from './core.mjs';
import { pushToBaidu } from './baidu.mjs';

const commit = 'a'.repeat(40);
const hashA = '1'.repeat(64);
const hashB = '2'.repeat(64);
const manifest = { schemaVersion: 1, commit, pages: [
  { url: SITE + '/', hash: hashA }, { url: SITE + '/news/item/', hash: hashB },
] };
const state = { schemaVersion: 1, pages: { [SITE + '/']: hashA, [SITE + '/removed/']: hashB } };
const response = value => ({ ok: true, json: async () => value, text: async () => value });
const liveFetch = async url => url.includes('search-manifest.json') ? response(manifest) :
  response(`<meta name="lilin-page-hash" content="${url.startsWith(SITE + '/?') ? hashA : hashB}">`);

test('only new or modified published pages are pending; removed and unchanged pages are excluded', () => {
  assert.deepEqual(changedPages(manifest, state), [manifest.pages[1]]);
  assert.equal(changedPages(manifest, { schemaVersion: 1, pages: { [SITE + '/']: hashB } }).length, 2);
  assert.throws(() => changedPages(manifest, {}), /checkpoint/);
});

test('manifest rejects foreign sites, credentials, noncanonical paths, bad hashes and duplicate pages', () => {
  for (const url of ['https://lilinst.com/', 'http://www.lilinst.com/', SITE + '/404.html',
    SITE + '/?x=1', SITE + '/#part', 'https://user@www.lilinst.com/', SITE + '/a/../']) {
    assert.throws(() => validateManifest({ ...manifest, pages: [{ url, hash: hashA }] }));
  }
  assert.throws(() => validateManifest({ ...manifest, pages: [manifest.pages[0], manifest.pages[0]] }));
  assert.throws(() => validateManifest({ ...manifest, pages: [{ url: SITE + '/', hash: 'bad' }] }));
  assert.throws(() => validateManifest(manifest, 'b'.repeat(40)));
});

test('build manifest is idempotent and includes only sitemap pages, with no redirect or noindex entries', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'lilin-search-'));
  try {
    const html = `<html><head><link rel="canonical" href="${SITE}/"></head><body>Published</body></html>`;
    await writeFile(path.join(dir, 'sitemap.xml'), `<urlset><url><loc>${SITE}/</loc></url></urlset>`);
    await writeFile(path.join(dir, 'index.html'), html);
    await writeFile(path.join(dir, '404.html'), '<meta name="robots" content="noindex">');
    await mkdir(path.join(dir, 'draft'));
    await writeFile(path.join(dir, 'draft/index.html'), 'Draft not in sitemap');
    const first = await buildManifest(dir, commit);
    assert.deepEqual(first.pages, [{ url: SITE + '/', hash: hashHtml(html) }]);
    const built = await readFile(path.join(dir, 'index.html'), 'utf8');
    assert.equal(pageHash(built), hashHtml(html));
    assert.deepEqual(await buildManifest(dir, commit), first);
    assert.equal(await readFile(path.join(dir, 'index.html'), 'utf8'), built);
    for (const extra of ['<meta name="robots" content="noindex, follow">', '<meta http-equiv="refresh" content="0">']) {
      await writeFile(path.join(dir, 'index.html'), html.replace('</head>', extra + '</head>'));
      await assert.rejects(buildManifest(dir, commit), /Non-indexable/);
    }
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('wait requires exact deployed commit AND fresh page markers', async () => {
  assert.deepEqual(await waitForDeployment({ commit, latestCommit: async () => commit, fetcher: liveFetch, attempts: 1 }), manifest);
  for (const fetcher of [
    async () => { throw new Error('Failed build / unreachable'); },
    async () => response({ ...manifest, commit: 'b'.repeat(40) }),
    async url => url.includes('search-manifest') ? response(manifest) : response('stale HTML'),
  ]) {
    await assert.rejects(waitForDeployment({ commit, latestCommit: async () => commit, fetcher, attempts: 1 }), /no URLs submitted/);
  }
});

test('superseded version exits without submitting or waiting on an obsolete build', async () => {
  assert.equal(await waitForDeployment({ commit, latestCommit: async () => 'b'.repeat(40),
    fetcher: () => { throw new Error('must not fetch'); }, attempts: 1 }), null);
});

test('only accepted URLs advance checkpoint, even when later URL hits quota', async () => {
  const saved = [];
  let calls = 0;
  await assert.rejects(submitChanges({ manifest, state: { schemaVersion: 1, pages: {} },
    submit: async () => ++calls === 1 ? { success: 1, remain: 0 } : { error: 400, message: 'quota exhausted' },
    save: async next => saved.push(structuredClone(next)), stillCurrent: async () => true, pause: async () => {},
  }), /remaining URLs kept pending/);
  assert.equal(calls, 2);
  assert.deepEqual(saved[0].pages, { [SITE + '/']: hashA });
  assert.deepEqual(changedPages(manifest, saved[0]), [manifest.pages[1]]);
});

test('Baidu rejected or malformed responses never advance state or print sensitive error text', async () => {
  for (const result of [{ error: 401, message: 'token=do-not-print' }, { success: 0 },
    { success: 1, not_same_site: [SITE + '/news/item/'] }, null]) {
    let saved = false;
    await assert.rejects(submitChanges({ manifest, state, submit: async () => result,
      save: async () => { saved = true; }, stillCurrent: async () => true }), error =>
      !error.message.includes('do-not-print') && /kept pending/.test(error.message));
    assert.equal(saved, false);
  }
});

test('production changes mid-run block submission; unchanged run sends zero URLs and prunes removals', async () => {
  await assert.rejects(submitChanges({ manifest, state, submit: () => { throw new Error('must not submit'); },
    save: () => { throw new Error('must not save'); }, stillCurrent: async () => false }), /version changed/);
  let saved;
  const result = await submitChanges({ manifest, state: { ...state, pages: { ...state.pages, [SITE + '/news/item/']: hashB } },
    submit: () => { throw new Error('must not submit'); }, save: async next => { saved = next; }, stillCurrent: async () => true });
  assert.deepEqual(result, { changed: 0, accepted: 0 });
  assert.equal(saved.pages[SITE + '/removed/'], undefined);
});

test('API refuses foreign URLs and invalid/missing credentials before any network request', () => {
  assert.throws(() => pushToBaidu('https://example.com/', 'anything'));
  assert.throws(() => pushToBaidu(SITE + '/', ''));
  assert.throws(() => pushToBaidu(SITE + '/', 'bad&token=value'));
});
