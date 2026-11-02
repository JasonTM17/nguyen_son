import { load } from "cheerio/slim";

export const PROFILE_URL = "https://github.com/JasonTM17";
export const MAX_HTML_BYTES = 1_000_000;

function text(value, limit) {
  return value.replace(/\s+/g, " ").trim().slice(0, limit);
}

export function parsePinnedRepositories(html) {
  if (typeof html !== "string" || Buffer.byteLength(html) > MAX_HTML_BYTES) throw new Error("Invalid profile document");
  const $ = load(html);
  if ($('meta[name="octolytics-dimension-user_login"]').attr("content") !== "JasonTM17") {
    throw new Error("Unexpected profile identity");
  }
  const section = $(".js-pinned-items-reorder-container");
  if (section.length !== 1) throw new Error("Profile showcase markup unavailable");
  const heading = text(section.find("h2").first().text(), 100);
  // GitHub can display automatically selected popular repos when nothing is pinned.
  if (/^Popular repositories\b/.test(heading)) return [];
  if (!/^Pinned\b/.test(heading)) throw new Error("Unrecognized showcase heading");
  const list = section.find(".js-pinned-items-reorder-list");
  if (list.length !== 1) throw new Error("Pinned list unavailable");
  const cards = list.find(".pinned-item-list-item");
  if (cards.length > 6) throw new Error("Unexpected pinned item count");
  const repositories = [];
  const seen = new Set();
  for (const element of cards.toArray()) {
    const card = $(element);
    if (card.find(".octicon-gist").length) continue;
    if (!card.find(".Box.public").length) throw new Error("Pinned repository is not explicitly public");
    const link = card.find("a").filter((_, anchor) => $(anchor).find(".repo").length > 0).first();
    const rawHref = link.attr("href");
    if (!rawHref) throw new Error("Pinned repository link unavailable");
    const url = new URL(rawHref, PROFILE_URL);
    if (url.origin !== "https://github.com" || url.username || url.password || url.search || url.hash || !/^\/[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+$/.test(url.pathname)) {
      throw new Error("Unsafe repository URL");
    }
    const fullName = url.pathname.slice(1);
    if (seen.has(fullName.toLowerCase())) throw new Error("Duplicate pinned repository");
    seen.add(fullName.toLowerCase());
    repositories.push({
      name: fullName.split("/")[1],
      fullName,
      href: url.href,
      description: text(card.find(".pinned-item-desc").text(), 600) || null,
      language: text(card.find('[itemprop="programmingLanguage"]').text(), 60) || null,
    });
  }
  return repositories;
}

export async function fetchPinnedProjects(fetchImpl = fetch, now = Date.now) {
  const response = await fetchImpl(PROFILE_URL, {
    headers: { Accept: "text/html", "User-Agent": "NguyenSonPortfolio/1.0" },
    redirect: "error",
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) throw new Error("Public profile unavailable");
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_HTML_BYTES) throw new Error("Profile exceeds size limit");
      chunks.push(Buffer.from(value));
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
  const repositories = parsePinnedRepositories(Buffer.concat(chunks).toString("utf8"));
  return { repositories, verifiedAt: new Date(now()).toISOString(), source: PROFILE_URL, stale: false };
}
