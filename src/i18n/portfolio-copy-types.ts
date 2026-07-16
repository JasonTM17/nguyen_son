export type PortfolioCopy = Readonly<{
  documentDescription: string;
  documentTitle: string;
  skipLink: string;
  homeLabel: string;
  navigationLabel: string;
  navigation: Readonly<Record<"about" | "archive" | "principles" | "work", string>>;
  language: Readonly<{ english: string; label: string; vietnamese: string }>;
  motion: Readonly<{ calmDescription: string; reduced: string; reduce: string; systemDescription: string }>;
  hero: Readonly<{
    actions: Readonly<{ github: string; work: string }>;
    eyebrow: string;
    focusAreas: string;
    lede: string;
    statement: string;
  }>;
  selectedWork: Readonly<{
    eyebrow: string;
    heading: string;
    projectNumber: (index: number) => string;
    technologies: (title: string) => string;
    viewRepository: string;
  }>;
  archive: Readonly<{
    eyebrow: string;
    heading: (count: number) => string;
    intro: string;
    language: string;
    projectNumber: (index: number) => string;
    syncFallback: string;
    syncLoading: string;
    syncSuccess: (date: string) => string;
    technologies: (title: string) => string;
    updated: string;
    viewRepository: string;
  }>;
  principles: Readonly<{ eyebrow: string; heading: string }>;
  about: Readonly<{ eyebrow: string; heading: string; paragraphs: readonly string[]; profileLink: string }>;
  footer: Readonly<{ eyebrow: string; heading: string; note: string; visitGithub: string }>;
  studio: Readonly<{
    controlsLabel: string;
    dragHint: string;
    meta: readonly [string, string];
    reset: string;
    rotateLeft: string;
    rotateRight: string;
  }>;
  assistant: Readonly<{
    close: string;
    formLabel: string;
    heading: string;
    launcher: string;
    launcherHint: string;
    launcherTitle: string;
    limitReached: string;
    panelEyebrow: string;
    placeholder: string;
    quickQuestions: readonly string[];
    send: string;
    sources: string;
    suggestedQuestions: string;
    thinking: string;
    unavailable: string;
    welcome: string;
  }>;
}>;
