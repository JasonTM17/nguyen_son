export type PinnedGithubProject = Readonly<{
  name: string;
  fullName: string;
  href: string;
  description: string | null;
  language: string | null;
}>;

export type PinnedProjectFeed = Readonly<{
  repositories: readonly PinnedGithubProject[];
  verifiedAt: string;
  source: string;
  stale: boolean;
}>;
