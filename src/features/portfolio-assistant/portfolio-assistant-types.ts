export type PortfolioAssistantRole = "assistant" | "user";

export type PortfolioAssistantMessage = Readonly<{
  content: string;
  id: string;
  role: PortfolioAssistantRole;
  sources?: readonly string[];
}>;

export type PortfolioAssistantReply = Readonly<{
  answer: string;
  sources: readonly string[];
}>;
