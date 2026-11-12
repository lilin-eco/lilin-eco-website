const REPOSITORY = 'lilin-eco/lilin-eco-website';
const STATE_BRANCH = 'codex/baidu-push-state';
const STATE_PATH = '.github/baidu-state.json';

export function githubClient(token) {
  if (!token) throw new Error('Missing GitHub Actions token');
  const api = async (path, options = {}) => {
    const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/${path}`, {
      ...options, redirect: 'error', signal: AbortSignal.timeout(20000),
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
    });
    if (response.status === 404 && options.allowMissing) return null;
    if (!response.ok) throw new Error(`GitHub checkpoint API failed (${response.status})`);
    return response.json();
  };
  return {
    latestCommit: async () => (await api('git/ref/heads/main')).object.sha,
    async loadState(seed) {
      let branch = await api(`git/ref/heads/${STATE_BRANCH}`, { allowMissing: true });
      let file = branch && await api(`contents/${STATE_PATH}?ref=${encodeURIComponent(STATE_BRANCH)}`, { allowMissing: true });
      if (branch && !file) throw new Error('Checkpoint branch exists without state; refusing to reset history');
      let state = file ? JSON.parse(Buffer.from(file.content, 'base64').toString('utf8')) : seed;
      return {
        state,
        async save(next) {
          if (!branch) {
            branch = await api('git/refs', { method: 'POST', body: JSON.stringify({
              ref: `refs/heads/${STATE_BRANCH}`, sha: (await api('git/ref/heads/main')).object.sha,
            }) });
          }
          const saved = await api(`contents/${STATE_PATH}`, { method: 'PUT', body: JSON.stringify({
            message: 'Record acknowledged Baidu page submissions', branch: STATE_BRANCH,
            content: Buffer.from(JSON.stringify(next, null, 2) + '\n').toString('base64'),
            ...(file ? { sha: file.sha } : {}),
          }) });
          file = saved.content;
          state = next;
        },
      };
    },
  };
}
