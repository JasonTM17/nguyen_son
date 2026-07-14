import { afterEach, describe, expect, it } from "vitest";
import {
  consumeQuestion,
  getPortfolioAssistantSessionId,
  getRemainingQuestions,
  portfolioAssistantQuestionLimit,
} from "./portfolio-assistant-storage";

afterEach(() => window.localStorage.clear());

describe("portfolio assistant storage", () => {
  it("keeps a stable anonymous visitor session", () => {
    expect(getPortfolioAssistantSessionId()).toBe(getPortfolioAssistantSessionId());
  });

  it("caps a browser visitor at seventy-five questions", () => {
    for (let question = 0; question < portfolioAssistantQuestionLimit; question += 1) consumeQuestion();

    expect(getRemainingQuestions()).toBe(0);
    expect(consumeQuestion()).toBe(0);
  });
});
