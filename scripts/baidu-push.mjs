import { readFile, writeFile, mkdir, appendFile } from 'node:fs/promises';
import { validateManifest, getProductionManifest, verifyPage, waitForDeployment, submitChanges } from './search/core.mjs';
import { githubClient } from './search/github.mjs';
import { pushToBaidu } from './search/baidu.mjs';

async function main() {
  const mode = process.argv[2];
  const commit = process.env.GITHUB_SHA;
  if (!/^[a-f0-9]{40}$/.test(commit ?? '') || process.env.GITHUB_REF !== 'refs/heads/main' ||
      process.env.GITHUB_REPOSITORY !== 'lilin-eco/lilin-eco-website') {
    throw new Error('Baidu submission is restricted to the production main branch');
  }
  const github = githubClient(process.env.GITHUB_TOKEN);
  if (mode === 'wait') {
    console.log(`Waiting for ESA production commit ${commit.slice(0, 12)} and all indexable pages`);
    const manifest = await waitForDeployment({ commit, latestCommit: github.latestCommit });
    if (!manifest) {
      console.log('A newer main commit superseded this run; the latest run will handle pending pages');
      if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, 'ready=false\n');
      return;
    }
    await mkdir('output', { recursive: true });
    await writeFile('output/baidu-live-manifest.json', JSON.stringify(manifest));
    if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, 'ready=true\n');
    console.log('Verified the exact production version and page markers');
  } else if (mode === 'submit') {
    const manifest = validateManifest(JSON.parse(await readFile('output/baidu-live-manifest.json', 'utf8')), commit);
    if (!process.env.BAIDU_PUSH_TOKEN) throw new Error('Missing BAIDU_PUSH_TOKEN repository secret');
    const seed = JSON.parse(await readFile('.github/baidu-initial-state.json', 'utf8'));
    const checkpoint = await github.loadState(seed);
    const stillCurrent = async page => {
      if (await github.latestCommit() !== commit) return false;
      if ((await getProductionManifest()).commit !== commit) return false;
      return verifyPage(page);
    };
    // No checkpoint mutation or submission if production was rolled back after waiting.
    if (await github.latestCommit() !== commit || (await getProductionManifest()).commit !== commit) {
      throw new Error('Production version changed before submission; no URLs submitted');
    }
    const result = await submitChanges({ manifest, state: checkpoint.state,
      submit: url => pushToBaidu(url, process.env.BAIDU_PUSH_TOKEN),
      save: checkpoint.save, stillCurrent });
    console.log(`Changed pages: ${result.changed}; accepted by Baidu: ${result.accepted}`);
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY,
      `ESA production version verified: \`${commit}\`\n\nNew or updated pages: **${result.changed}**. Baidu accepted: **${result.accepted}**.\n\nOnly acknowledged page hashes are checkpointed. Submission does not guarantee indexing.\n`);
  } else throw new Error('Use wait or submit');
}

main().catch(error => {
  // Never serialize request/response objects, URLs carrying tokens, or error causes.
  const secret = process.env.BAIDU_PUSH_TOKEN;
  let message = String(error.message ?? 'Baidu automation failed').replace(/token=[^\s&"']+/gi, 'token=[REDACTED]');
  if (secret) message = message.split(secret).join('[REDACTED]');
  console.error(message);
  process.exitCode = 1;
});
