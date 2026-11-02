const PROFILE = "https://github.com/JasonTM17";
const MAX_AGE = 86_400_000;

export function isPinnedListQuestion(message) {
  const normalized = message.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/đ/g, "d").toLowerCase();
  if (!/\b(?:ghim|pinned|pins|featured|spotlight)\b/.test(normalized)) return false;
  // A technology/behavior question about a pinned project is not an inventory.
  // Conversational "how about listing" still is; do not reject "how" globally.
  if (/\b(?:giai thich|phan tich|so sanh|explain|compare|architecture|kien truc|tai sao|why|languages?|technolog(?:y|ies)|stack|cong nghe|ngon ngu|su dung|dung|uses?|using|built|works?|hoat dong)\b/.test(normalized)) return false;
  if (/\b(?:list(?:ing)?|show(?:ing)?|liet ke|danh sach|how many|bao nhieu)\b/.test(normalized)) return true;
  return /\b(?:nao|nhung|cac|dang|hien|which|what|current|currently)\b/.test(normalized) ||
    /\b(?:pinned|featured)\s+(?:projects|repos|repositories)\b/.test(normalized) || /^(?:pins|du an ghim)[?!.\s]*$/.test(normalized);
}

function validFeed(feed, now) {
  if (!feed || feed.source !== PROFILE || typeof feed.stale !== "boolean" || typeof feed.verifiedAt !== "string" || !Array.isArray(feed.repositories) || feed.repositories.length > 6) return false;
  const age = now() - Date.parse(feed.verifiedAt);
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE) return false;
  const seen = new Set();
  return feed.repositories.every((repo) => {
    if (!repo || typeof repo.fullName !== "string" || !/^[A-Za-z0-9-]+\/(?!\.{1,2}$)[A-Za-z0-9_.-]{1,100}$/.test(repo.fullName) ||
        repo.name !== repo.fullName.split("/")[1] || repo.href !== `https://github.com/${repo.fullName}` ||
        !(repo.language === null || typeof repo.language === "string" && repo.language.length <= 60) || seen.has(repo.fullName.toLowerCase())) return false;
    seen.add(repo.fullName.toLowerCase());
    return true;
  });
}

export function buildPinnedReply(feed, language, now = Date.now) {
  const vi = language === "vi";
  const profileLink = { title: vi ? "Xem mục ghim trên GitHub" : "View pins on GitHub", href: PROFILE };
  if (!validFeed(feed, now)) return {
    answer: vi ? "Mình chưa xác minh được danh sách đang ghim trên GitHub. Bạn có thể mở hồ sơ bên dưới để xem trực tiếp." : "I could not verify the current GitHub pins. Open the profile below to check them directly.",
    sources: [], references: [profileLink],
  };
  const verified = new Intl.DateTimeFormat(vi ? "vi-VN" : "en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(feed.verifiedAt));
  const summary = feed.stale
    ? vi ? `GitHub tạm thời chưa xác minh lại được. Đây là danh sách đã lưu, xác minh lúc ${verified} (giờ Việt Nam); các mục ghim hiện tại có thể đã thay đổi.` : `GitHub could not be rechecked. This is the saved list verified ${verified} (Vietnam time); the current pins may have changed.`
    : vi ? `Danh sách ghim công khai theo thứ tự trên GitHub, xác minh lúc ${verified} (giờ Việt Nam).` : `Public pins in GitHub display order, verified ${verified} (Vietnam time).`;
  const repositories = feed.repositories.map(({ name, fullName, href, language: repositoryLanguage }) => ({ name, fullName, href, language: repositoryLanguage }));
  const empty = vi ? "Hồ sơ không có repository công khai nào được ghim trong lần xác minh này." : "No public repositories were pinned at this verification.";
  const intro = repositories.length ? summary : `${summary}\n\n${empty}`;
  return {
    answer: `${intro}${repositories.length ? `\n\n${repositories.map((repo, index) => `${index + 1}. ${repo.fullName}`).join("\n")}` : ""}`,
    sources: repositories.map((repo) => `${repo.name} project`),
    references: [profileLink],
    pinnedProjects: { summary: intro, repositories, verifiedAt: feed.verifiedAt, stale: feed.stale, source: PROFILE },
  };
}
