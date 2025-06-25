// (1) Конфигурация
// const GITHUB_TOKEN = 'ВАШ_GITHUB_TOKEN'; // рекомендуется хранить в env
const headers = {
  'Accept': 'application/vnd.github.v3+json',
//   'Authorization': `token ${GITHUB_TOKEN}`
};

const repos = [
  { owner: 'ethers-io', repo: 'ethers.js', package: 'ethers' },
  { owner: 'viem',     repo: 'viem',      package: 'viem' }
];

// (2) Функция для получения метрик из GitHub
async function fetchGitHubMetrics(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo.replace('.js','')}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const { stargazers_count, forks_count, watchers_count, updated_at } = await res.json();
  return { stars: stargazers_count, forks: forks_count, watchers: watchers_count, lastRelease: updated_at };
}

// (3) Функция для загрузок из npm
async function fetchNpmMetrics(pkgName) {
  // загрузки за неделю
  const dlRes = await fetch(`https://api.npmjs.org/downloads/point/last-week/${pkgName}`);
  const { downloads } = await dlRes.json();
  // метаданные пакета
  const metaRes = await fetch(`https://registry.npmjs.org/${pkgName}`);
  const meta = await metaRes.json();
  const dependentsCount = meta._dependentCount ?? 'n/a';
  const dependenciesCount = meta.versions[meta['dist-tags'].latest].dependencies
    ? Object.keys(meta.versions[meta['dist-tags'].latest].dependencies).length
    : 0;
  return { downloads, dependents: dependentsCount, dependencies: dependenciesCount };
}

// (4) Основная функция, собирающая всё вместе
async function loadMetrics() {
  const tableBody = document.querySelector('#metrics-table tbody');
  tableBody.innerHTML = '';

  for (const { owner, repo, package: pkg } of repos) {
    try {
      const gh = await fetchGitHubMetrics(owner, repo);
      const np = await fetchNpmMetrics(pkg);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${repo}</td>
        <td>${gh.stars.toLocaleString()}</td>
        <td>${gh.forks.toLocaleString()}</td>
        <td>${gh.watchers.toLocaleString()}</td>
        <td>${np.downloads.toLocaleString()}</td>
        <td>${np.dependents.toLocaleString()}</td>
        <td>${np.dependencies}</td>
        <td>${new Date(gh.lastRelease).toLocaleDateString()}</td>
      `;
      tableBody.appendChild(row);

    } catch (e) {
      console.error(`Ошибка при загрузке метрик для ${repo}:`, e);
    }
  }
}

// (5) Запуск при загрузке страницы и каждые 10 минут
window.addEventListener('DOMContentLoaded', () => {
  loadMetrics();
  setInterval(loadMetrics, 10 * 60 * 1000);
});
