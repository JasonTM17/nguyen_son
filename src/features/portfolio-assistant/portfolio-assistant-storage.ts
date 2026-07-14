const CHAT_LIMIT = 75;
const QUESTION_WINDOW_MILLISECONDS = 24 * 60 * 60 * 1000;
const QUESTION_BUDGET_KEY = "nguyen-son-portfolio-assistant-budget-v1";
const SESSION_KEY = "nguyen-son-portfolio-assistant-session-v1";

type QuestionBudget = {
  readonly startedAt: number;
  readonly used: number;
};

function readBudget(): QuestionBudget | null {
  try {
    const rawValue = window.localStorage.getItem(QUESTION_BUDGET_KEY);
    if (!rawValue) return null;
    const budget = JSON.parse(rawValue) as QuestionBudget;
    if (typeof budget.startedAt !== "number" || typeof budget.used !== "number") return null;
    return budget;
  } catch {
    return null;
  }
}

function writeBudget(budget: QuestionBudget): void {
  try {
    window.localStorage.setItem(QUESTION_BUDGET_KEY, JSON.stringify(budget));
  } catch {
    // The server-side budget remains active when browser storage is unavailable.
  }
}

function getCurrentBudget(now = Date.now()): QuestionBudget {
  const existingBudget = readBudget();
  if (!existingBudget || now - existingBudget.startedAt >= QUESTION_WINDOW_MILLISECONDS) {
    return { startedAt: now, used: 0 };
  }
  return existingBudget;
}

function createSessionId(): string {
  if (typeof window.crypto?.randomUUID === "function") return window.crypto.randomUUID();
  return `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getPortfolioAssistantSessionId(): string {
  try {
    const existingSessionId = window.localStorage.getItem(SESSION_KEY);
    if (existingSessionId) return existingSessionId;
    const sessionId = createSessionId();
    window.localStorage.setItem(SESSION_KEY, sessionId);
    return sessionId;
  } catch {
    return createSessionId();
  }
}

export function getRemainingQuestions(): number {
  return Math.max(0, CHAT_LIMIT - getCurrentBudget().used);
}

export function consumeQuestion(): number {
  const budget = getCurrentBudget();
  const nextBudget = { ...budget, used: Math.min(CHAT_LIMIT, budget.used + 1) };
  writeBudget(nextBudget);
  return CHAT_LIMIT - nextBudget.used;
}

export function restoreRemainingQuestions(remaining: number): number {
  const boundedRemaining = Math.min(CHAT_LIMIT, Math.max(0, Math.floor(remaining)));
  const budget = getCurrentBudget();
  writeBudget({ ...budget, used: CHAT_LIMIT - boundedRemaining });
  return boundedRemaining;
}

export const portfolioAssistantQuestionLimit = CHAT_LIMIT;
