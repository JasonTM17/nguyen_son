import { portfolioDocuments } from "./portfolio-assistant-knowledge.mjs";

const STOP_WORDS = new Set([
  "a", "about", "and", "are", "cua", "cho", "co", "cung", "does", "for", "from", "how", "is",
  "la", "nhung", "nhu", "nhung", "please", "the", "to", "toi", "va", "what", "which", "with",
]);
const PROFILE_QUERY_TERMS = new Set([
  "about", "age", "born", "community", "feedback", "help", "hoc", "nganh", "nguyen", "school",
  "sinh", "sinhvien", "son", "student", "study", "truong", "tuoi", "university",
]);

function toSearchTerms(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .split(/[^\p{L}\p{N}+#.-]+/u)
    .filter((term) => term.length > 1 && !STOP_WORDS.has(term));
}

function cleanText(value, maximumLength) {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned || cleaned.length > maximumLength) return null;
  return cleaned;
}

export function sanitizeHistory(rawHistory) {
  if (!Array.isArray(rawHistory)) return [];

  return rawHistory
    .slice(-6)
    .flatMap((message) => {
      // The browser controls this payload, so only preserve prior visitor questions.
      // Model-authored turns must never be accepted as a caller-controlled assistant instruction.
      if (!message || message.role !== "user") return [];
      const content = cleanText(message.content, 450);
      return content ? [{ role: "user", content }] : [];
    });
}

function scoreDocument(document, terms) {
  const searchable = `${document.title} ${document.keywords} ${document.content}`
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase();
  const keywords = document.keywords.toLocaleLowerCase();

  return terms.reduce((score, term) => {
    if (!searchable.includes(term)) return score;
    return score + (keywords.includes(term) ? 4 : 1);
  }, 0);
}

function shouldIncludePublicProfile(message) {
  return toSearchTerms(message).some((term) => PROFILE_QUERY_TERMS.has(term));
}

export function retrievePortfolioContext(message, history = []) {
  const terms = toSearchTerms([message, ...history.map((item) => item.content)].join(" "));
  const profile = portfolioDocuments.find((document) => document.id === "student-profile");
  const ranked = portfolioDocuments
    .filter((document) => document.id !== "student-profile")
    .map((document) => ({ document, score: scoreDocument(document, terms) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.document.title.localeCompare(right.document.title))
    .slice(0, 5)
    .map(({ document }) => document);
  // Owner-approved biography only belongs in a request that actually asks about it.
  // This keeps unrelated project questions from sending profile details to the model.
  const selected = [...(profile && shouldIncludePublicProfile(message) ? [profile] : []), ...ranked];

  return {
    context: selected.map((document) => `[${document.title}] ${document.content}`).join("\n"),
    sources: selected.map((document) => document.title),
  };
}

export function parseChatRequest(body) {
  let payload = body;
  if (typeof body === "string") {
    try {
      payload = JSON.parse(body);
    } catch {
      return { error: "The chat request must be valid JSON." };
    }
  }

  const message = cleanText(payload?.message, 700);
  const sessionId = cleanText(payload?.sessionId, 120);
  if (!message) return { error: "Please enter a question of up to 700 characters." };
  if (!sessionId || !/^[a-z0-9-]+$/i.test(sessionId)) return { error: "This chat session is invalid. Please refresh and try again." };

  return { history: sanitizeHistory(payload.history), message, sessionId };
}
