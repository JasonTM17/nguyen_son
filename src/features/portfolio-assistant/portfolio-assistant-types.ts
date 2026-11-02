export type PortfolioAssistantRole = "assistant" | "user";
export type PortfolioAssistantReference = Readonly<{ title: string; href: string }>;
export type PortfolioAssistantPins = Readonly<{
  summary: string;
  source: string;
  verifiedAt: string;
  stale: boolean;
  repositories: readonly Readonly<{ name: string; fullName: string; href: string; language: string | null }>[];
}>;

export type PortfolioAssistantMessage = Readonly<{
  content: string;
  id: string;
  role: PortfolioAssistantRole;
  sources?: readonly string[];
  references?: readonly PortfolioAssistantReference[];
  pinnedProjects?: PortfolioAssistantPins;
}>;

export type PortfolioAssistantReply = Readonly<{
  answer: string;
  sources: readonly string[];
  references?: readonly PortfolioAssistantReference[];
  pinnedProjects?: PortfolioAssistantPins;
}>;
