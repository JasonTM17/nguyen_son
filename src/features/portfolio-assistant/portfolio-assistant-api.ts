import type { PortfolioAssistantMessage, PortfolioAssistantReply } from "./portfolio-assistant-types";
import { portfolioCopy } from "../../i18n/portfolio-copy";
import type { PortfolioLanguage } from "../../i18n/portfolio-language-context";

type ApiPayload = {
  answer?: unknown;
  error?: unknown;
  sources?: unknown;
};

export class PortfolioAssistantApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PortfolioAssistantApiError";
  }
}

function getSources(payload: ApiPayload): readonly string[] {
  return Array.isArray(payload.sources) ? payload.sources.filter((source): source is string => typeof source === "string") : [];
}

function getAnswer(payload: ApiPayload): string | null {
  return typeof payload.answer === "string" && payload.answer.trim() ? payload.answer.trim() : null;
}

export async function askPortfolioAssistant(
  message: string,
  history: readonly PortfolioAssistantMessage[],
  sessionId: string,
  language: PortfolioLanguage,
): Promise<PortfolioAssistantReply> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history: history.slice(-6).map(({ content, role }) => ({ content, role })),
      language,
      sessionId,
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as ApiPayload;
  const answer = getAnswer(payload);
  if (!response.ok || !answer) {
    const error = typeof payload.error === "string" ? payload.error : portfolioCopy[language].assistant.unavailable;
    throw new PortfolioAssistantApiError(error);
  }

  return { answer, sources: getSources(payload) };
}
