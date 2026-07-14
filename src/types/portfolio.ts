export type ExternalLink = {
  readonly href: string;
  readonly label: string;
};

export type PortfolioProject = {
  readonly category: string;
  readonly description: string;
  readonly href: string;
  readonly tags: readonly string[];
  readonly title: string;
};
