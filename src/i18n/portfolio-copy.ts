import { englishPortfolioCopy } from "./portfolio-copy-en";
import { vietnamesePortfolioCopy } from "./portfolio-copy-vi";
import type { PortfolioCopy } from "./portfolio-copy-types";
import type { PortfolioLanguage } from "./portfolio-language-context";

export type { PortfolioCopy } from "./portfolio-copy-types";

export const portfolioCopy: Record<PortfolioLanguage, PortfolioCopy> = {
  en: englishPortfolioCopy,
  vi: vietnamesePortfolioCopy,
};
