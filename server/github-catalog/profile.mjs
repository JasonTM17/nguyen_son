export const CATALOG_SOURCE = "https://github.com/JasonTM17?tab=repositories";
const API_URL = "https://api.github.com/users/JasonTM17/repos?type=owner&per_page=100&sort=updated&direction=desc";
const MAX_PAGES = 10;
const MAX_TOTAL_BYTES = 2_000_000;
const EXCLUDED = new Set(["jasontm17", "nguyen_son"]);

function text(value, maximum) {
  return typeof value === "string" ? value.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, maximum) || null : null;
}

export function normalizePublicRepository(repo) {
  if (!repo || typeof repo !== "object") throw new Error("Invalid repository");
  if (repo.private !== false || repo.fork === true || repo.disabled === true) return null;
  if (typeof repo.name !== "string" || !/^(?!\.{1,2}$)[A-Za-z0-9_.-]{1,100}$/.test(repo.name) ||
      repo.owner?.login !== "JasonTM17" || repo.full_name !== `JasonTM17/${repo.name}` ||
      repo.html_url !== `https://github.com/JasonTM17/${repo.name}`) throw new Error("Unexpected public repository identity");
  if (EXCLUDED.has(repo.name.toLowerCase())) return null;
  return {
    name: repo.name,
    href: repo.html_url,
    description: text(repo.description, 600),
    language: text(repo.language, 60),
    topics: Array.isArray(repo.topics) ? [...new Set(repo.topics.map((topic) => text(topic, 50)).filter(Boolean))].slice(0, 20) : [],
    updatedAt: typeof repo.updated_at === "string" && Number.isFinite(Date.parse(repo.updated_at)) ? new Date(repo.updated_at).toISOString() : null,
  };
}

async function readPage(response, budget) {
  if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) throw new Error("Public catalog unavailable");
  const reader = response.body.getReader();
  const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      budget.bytes += value.byteLength;
      if (budget.bytes > MAX_TOTAL_BYTES) throw new Error("Public catalog too large");
      chunks.push(Buffer.from(value));
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
  const data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!Array.isArray(data) || data.length > 100) throw new Error("Invalid catalog page");
  return data;
}

export async function fetchPublicCatalog(fetchImpl = fetch, now = Date.now) {
  const signal = AbortSignal.timeout(7000);
  const budget = { bytes: 0 };
  const repositories = [];
  const seen = new Set();
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    // Never follow a caller URL or the provider's Link URL; only inspect its next-page flag.
    const response = await fetchImpl(`${API_URL}&page=${page}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "NguyenSonPortfolio/1.0" },
      redirect: "error", signal,
    });
    for (const raw of await readPage(response, budget)) {
      const repository = normalizePublicRepository(raw);
      if (!repository) continue;
      const key = repository.name.toLowerCase();
      if (seen.has(key)) throw new Error("Duplicate public repository");
      seen.add(key);
      repositories.push(repository);
    }
    if (!response.headers.get("link")?.includes('rel="next"')) {
      repositories.sort((left, right) => (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "") || left.name.localeCompare(right.name));
      return { repositories, verifiedAt: new Date(now()).toISOString(), source: CATALOG_SOURCE, stale: false };
    }
  }
  throw new Error("Catalog pagination exceeded limit");
}
