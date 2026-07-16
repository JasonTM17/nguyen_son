const MAXIMUM_QUESTIONS = 75;
const WINDOW_MILLISECONDS = 24 * 60 * 60 * 1000;
const counters = new Map();

function pruneExpiredCounters(now) {
  for (const [identifier, counter] of counters) {
    if (now - counter.startedAt >= WINDOW_MILLISECONDS) counters.delete(identifier);
  }
}

export function takeQuestionAllowance(identifier) {
  const now = Date.now();
  pruneExpiredCounters(now);
  const current = counters.get(identifier) ?? { count: 0, startedAt: now };
  if (current.count >= MAXIMUM_QUESTIONS) {
    return { allowed: false, remaining: 0, resetAt: current.startedAt + WINDOW_MILLISECONDS };
  }

  const next = { ...current, count: current.count + 1 };
  counters.set(identifier, next);
  return {
    allowed: true,
    remaining: MAXIMUM_QUESTIONS - next.count,
    resetAt: next.startedAt + WINDOW_MILLISECONDS,
  };
}

export function releaseQuestionAllowance(identifier) {
  const current = counters.get(identifier);
  if (!current) return MAXIMUM_QUESTIONS;

  const remainingCount = Math.max(0, current.count - 1);
  if (remainingCount === 0) counters.delete(identifier);
  else counters.set(identifier, { ...current, count: remainingCount });
  return MAXIMUM_QUESTIONS - remainingCount;
}

export const chatQuestionLimit = MAXIMUM_QUESTIONS;
