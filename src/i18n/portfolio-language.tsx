import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { portfolioCopy } from "./portfolio-copy";
import {
  portfolioLanguages,
  PortfolioLanguageContext,
  type PortfolioLanguage,
} from "./portfolio-language-context";

const LANGUAGE_STORAGE_KEY = "nguyen-son-portfolio-language";

function isPortfolioLanguage(value: unknown): value is PortfolioLanguage {
  return typeof value === "string" && portfolioLanguages.includes(value as PortfolioLanguage);
}

function getInitialLanguage(): PortfolioLanguage {
  if (typeof window === "undefined") return "en";

  try {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isPortfolioLanguage(savedLanguage)) return savedLanguage;
  } catch {
    // The browser locale remains a useful default when storage is unavailable.
  }

  return window.navigator.language.toLowerCase().startsWith("vi") ? "vi" : "en";
}

function persistLanguage(language: PortfolioLanguage): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // A private or constrained browser can still switch language for this visit.
  }
}

type PortfolioLanguageProviderProps = Readonly<{
  children: ReactNode;
}>;

export function PortfolioLanguageProvider({ children }: PortfolioLanguageProviderProps) {
  const [language, setLanguageState] = useState<PortfolioLanguage>(getInitialLanguage);

  const setLanguage = useCallback((nextLanguage: PortfolioLanguage) => {
    setLanguageState(nextLanguage);
    persistLanguage(nextLanguage);
  }, []);

  useEffect(() => {
    const copy = portfolioCopy[language];
    document.documentElement.lang = language;
    document.title = copy.documentTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", copy.documentDescription);
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language, setLanguage],
  );

  return <PortfolioLanguageContext.Provider value={value}>{children}</PortfolioLanguageContext.Provider>;
}
