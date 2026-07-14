export type PublicGithubRepository = Readonly<{
  description: string | null;
  href: string;
  language: string | null;
  name: string;
  topics: readonly string[];
  updatedAt: string | null;
}>;
