import { portfolioDocuments } from "./portfolio-assistant-knowledge.mjs";

const STOP_WORDS = new Set([
  "a", "about", "an", "and", "are", "cua", "cho", "co", "cung", "does", "du", "dung", "for",
  "from", "how", "is", "la", "nao", "nhu", "nhung", "please", "su", "the", "to", "toi", "va",
  "what", "which", "with",
]);
const PROFILE_QUERY_TERMS = new Set([
  "about", "age", "born", "community", "feedback", "help", "hoc", "nganh", "nguyen", "school",
  "sinh", "sinhvien", "son", "student", "study", "truong", "tuoi", "university",
]);
const PROJECT_LIST_PATTERNS = [
  /\b(?:which|what|list|show)\b[^\n]{0,80}\bprojects\b/u,
  /\bprojects\b[^\n]{0,80}\b(?:use|uses|using|built|have|include)\b/u,
  /\b(?:nhung|cac)\s+du\s+an\b/u,
  /\bdu\s+an\s+nao\b/u,
  /\bliet\s+ke\b[^\n]{0,80}\bdu\s+an\b/u,
];
const CHAT_LANGUAGES = new Set(["en", "vi"]);
const CHAT_ERRORS = {
  en: {
    configuring: "The portfolio assistant is being configured. Please try again shortly.",
    invalidJson: "The chat request must be valid JSON.",
    invalidMessage: "Please enter a question of up to 700 characters.",
    invalidSession: "This chat session is invalid. Please refresh and try again.",
    methodNotAllowed: "Method not allowed.",
    noReply: "The portfolio assistant could not prepare a reply. Please try again shortly.",
    serverLimit: "This connection has reached its temporary 75-question server limit. Please come back after the daily limit resets.",
    unavailable: "The portfolio assistant is temporarily unavailable. Please try again shortly.",
    unsupportedLanguage: "The selected chat language is invalid. Please refresh and try again.",
  },
  vi: {
    configuring: "Trợ lý portfolio đang được cấu hình. Vui lòng thử lại sau.",
    invalidJson: "Yêu cầu trò chuyện phải là JSON hợp lệ.",
    invalidMessage: "Vui lòng nhập câu hỏi không quá 700 ký tự.",
    invalidSession: "Phiên trò chuyện không hợp lệ. Vui lòng tải lại trang rồi thử lại.",
    methodNotAllowed: "Phương thức này không được hỗ trợ.",
    noReply: "Trợ lý portfolio chưa thể tạo câu trả lời. Vui lòng thử lại sau.",
    serverLimit: "Kết nối này đã đạt giới hạn tạm thời 75 câu hỏi trên máy chủ. Vui lòng quay lại sau khi giới hạn hằng ngày được đặt lại.",
    unavailable: "Trợ lý portfolio tạm thời chưa phản hồi được. Vui lòng thử lại sau.",
    unsupportedLanguage: "Ngôn ngữ trò chuyện đã chọn không hợp lệ. Vui lòng tải lại trang rồi thử lại.",
  },
};

export function getChatError(language, errorKey) {
  const copy = CHAT_ERRORS[CHAT_LANGUAGES.has(language) ? language : "en"];
  return copy[errorKey];
}

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
  const searchableTerms = new Set(toSearchTerms(`${document.title} ${document.keywords} ${document.content}`));
  const keywordTerms = new Set(toSearchTerms(document.keywords));

  return terms.reduce((score, term) => {
    if (!searchableTerms.has(term)) return score;
    return score + (keywordTerms.has(term) ? 4 : 1);
  }, 0);
}

function shouldIncludePublicProfile(message) {
  return toSearchTerms(message).some((term) => PROFILE_QUERY_TERMS.has(term));
}

function isProjectListQuestion(message) {
  const normalizedMessage = message
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase();

  return PROJECT_LIST_PATTERNS.some((pattern) => pattern.test(normalizedMessage));
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
  const projectCount = selected.filter((document) => document.kind === "project").length;

  return {
    context: selected.map((document) => `[${document.title}] ${document.content}`).join("\n"),
    projectCount,
    scopeProjectList: projectCount > 0 && isProjectListQuestion(message),
    sources: selected.map((document) => document.title),
  };
}

export function parseChatRequest(body) {
  let payload = body;
  if (typeof body === "string") {
    try {
      payload = JSON.parse(body);
    } catch {
      return { error: getChatError("en", "invalidJson") };
    }
  }

  const language = payload?.language ?? "en";
  if (!CHAT_LANGUAGES.has(language)) return { error: getChatError("en", "unsupportedLanguage") };

  const message = cleanText(payload?.message, 700);
  const sessionId = cleanText(payload?.sessionId, 120);
  if (!message) return { error: getChatError(language, "invalidMessage") };
  if (!sessionId || !/^[a-z0-9-]+$/i.test(sessionId)) return { error: getChatError(language, "invalidSession") };

  return { history: sanitizeHistory(payload.history), language, message, sessionId };
}
