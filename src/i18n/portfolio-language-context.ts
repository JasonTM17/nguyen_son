import { createContext, useContext } from "react";

export const portfolioLanguages = ["en", "vi"] as const;

export type PortfolioLanguage = (typeof portfolioLanguages)[number];

type PortfolioLanguageContextValue = Readonly<{
  language: PortfolioLanguage;
  setLanguage: (language: PortfolioLanguage) => void;
}>;

const defaultContextValue: PortfolioLanguageContextValue = {
  language: "en",
  setLanguage: () => undefined,
};

export const PortfolioLanguageContext = createContext<PortfolioLanguageContextValue>(defaultContextValue);

export function usePortfolioLanguage(): PortfolioLanguageContextValue {
  return useContext(PortfolioLanguageContext);
}
