import React, { useEffect, useState } from 'react';

interface MaturityRow {
  stars: number;
  forks: number;
  watchers: number;
  downloads: number;
  dependents: number | string;
  dependencies: number;
  lastRelease: string;
  firstRelease: string;
}

const repos = [
  { owner: 'ethers-io', repo: 'ethers.js', package: 'ethers', key: 'ethers' },
  { owner: 'wagmi-dev', repo: 'viem', package: 'viem', key: 'viem' }
];

const headers = {
  'Accept': 'application/vnd.github.v3+json',
  // 'Authorization': `token ${GITHUB_TOKEN}` // Необходим для большего количества запросов
};

async function fetchGitHubMetrics(owner: string, repo: string) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const { stargazers_count, forks_count, watchers_count, created_at } = await res.json();
  return { stars: stargazers_count, forks: forks_count, watchers: watchers_count, firstRelease: created_at };
}

async function fetchLastReleaseDate(owner: string, repo: string): Promise<string | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  const res = await fetch(url, { headers });
  if (!res.ok) return null; // если нет релизов
  const { published_at } = await res.json();
  return published_at;
}

async function fetchNpmMetrics(pkgName: string) {
  const dlRes = await fetch(`https://api.npmjs.org/downloads/point/last-week/${pkgName}`);
  const { downloads } = await dlRes.json();
  const metaRes = await fetch(`https://registry.npmjs.org/${pkgName}`);
  const meta = await metaRes.json();
  // dependents захардкожено
  const dependentsCount =
    pkgName === 'ethers'
      ? import.meta.env.VITE_ETHERS_DEPENDENTS
      : import.meta.env.VITE_VIEM_DEPENDENTS;
  const dependenciesCount = meta.versions[meta['dist-tags'].latest].dependencies
    ? Object.keys(meta.versions[meta['dist-tags'].latest].dependencies).length
    : 0;
  return { downloads, dependents: dependentsCount, dependencies: dependenciesCount };
}

const METRICS = [
  { key: 'stars', label: 'Stars' },
  { key: 'forks', label: 'Forks' },
  { key: 'watchers', label: 'Watchers' },
  { key: 'downloads', label: 'NPM downloads (last week)' },
  { key: 'dependents', label: 'NPM dependents' },
  { key: 'dependencies', label: 'NPM dependencies' },
  { key: 'lastRelease', label: 'Last release' },
  { key: 'firstRelease', label: 'First release date' },
];

type MaturityData = Record<'ethers' | 'viem', MaturityRow | undefined>;

const MaturityMetrics: React.FC = () => {
  const [data, setData] = useState<MaturityData>({ ethers: undefined, viem: undefined });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);
    const newData: MaturityData = { ethers: undefined, viem: undefined };
    for (const { owner, repo, package: pkg, key } of repos) {
      try {
        const gh = await fetchGitHubMetrics(owner, repo);
        const lastRelease = await fetchLastReleaseDate(owner, repo);
        const np = await fetchNpmMetrics(pkg);
        newData[key as 'ethers' | 'viem'] = {
          stars: gh.stars,
          forks: gh.forks,
          watchers: gh.watchers,
          downloads: np.downloads,
          dependents: np.dependents,
          dependencies: np.dependencies,
          lastRelease: lastRelease ?? 'n/a',
          firstRelease: gh.firstRelease,
        };
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(`Ошибка при загрузке метрик для ${repo}: ${e.message}`);
        } else {
          setError(`Ошибка при загрузке метрик для ${repo}`);
        }
      }
    }
    setData(newData);
    setLoading(false);
  };

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Зрелость библиотек и активность сообщества (GitHub & NPM метрики)</h2>
      {loading && <div>Загрузка...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table className="metrics-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginTop: 16 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Метрика</th>
            <th>Ethers</th>
            <th>Viem</th>
          </tr>
        </thead>
        <tbody>
          {METRICS.map(metric => (
            <tr key={metric.key}>
              <td style={{ textAlign: 'left' }}>{metric.label}</td>
              <td>{
                data.ethers
                  ? (metric.key === 'lastRelease' || metric.key === 'firstRelease')
                    ? data.ethers[metric.key] !== 'n/a'
                      ? new Date(data.ethers[metric.key] as string).toLocaleDateString()
                      : 'n/a'
                    : typeof data.ethers[metric.key as keyof MaturityRow] === 'number'
                      ? (data.ethers[metric.key as keyof MaturityRow] as number).toLocaleString()
                      : data.ethers[metric.key as keyof MaturityRow]
                  : '-'
              }</td>
              <td>{
                data.viem
                  ? (metric.key === 'lastRelease' || metric.key === 'firstRelease')
                    ? data.viem[metric.key] !== 'n/a'
                      ? new Date(data.viem[metric.key] as string).toLocaleDateString()
                      : 'n/a'
                    : typeof data.viem[metric.key as keyof MaturityRow] === 'number'
                      ? (data.viem[metric.key as keyof MaturityRow] as number).toLocaleString()
                      : data.viem[metric.key as keyof MaturityRow]
                  : '-'
              }</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
        Примечание: метрика <b>NPM dependents</b> недоступна через API и не обновляется автоматически. Значение указано вручную.
      </div>
    </div>
  );
};

export default MaturityMetrics;
