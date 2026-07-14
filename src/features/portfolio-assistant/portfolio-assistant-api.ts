import type { PortfolioAssistantMessage, PortfolioAssistantReply } from "./portfolio-assistant-types";

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

export async function askPortfolioAssistant(
  message: string,
  history: readonly PortfolioAssistantMessage[],
  sessionId: string,
): Promise<PortfolioAssistantReply> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history: history.slice(-6).map(({ content, role }) => ({ content, role })),
      sessionId,
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as ApiPayload;
  if (!response.ok || typeof payload.answer !== "string") {
    const error = typeof payload.error === "string" ? payload.error : "The assistant is unavailable. Please try again shortly.";
    throw new PortfolioAssistantApiError(error);
  }

  return { answer: payload.answer, sources: getSources(payload) };
}
