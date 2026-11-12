import { execFileSync } from 'node:child_process';
import { buildManifest } from './search/core.mjs';

const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const manifest = await buildManifest('dist', commit);
console.log(`Search manifest: ${manifest.pages.length} pages, commit ${commit.slice(0, 12)}`);
