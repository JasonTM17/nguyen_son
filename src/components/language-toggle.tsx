import { portfolioCopy } from "../i18n/portfolio-copy";
import { portfolioLanguages, usePortfolioLanguage } from "../i18n/portfolio-language-context";

export function LanguageToggle() {
  const { language, setLanguage } = usePortfolioLanguage();
  const copy = portfolioCopy[language].language;

  return (
    <div aria-label={copy.label} className="language-toggle" role="group">
      {portfolioLanguages.map((option) => (
        <button
          aria-label={option === "vi" ? copy.vietnamese : copy.english}
          aria-pressed={language === option}
          className="language-toggle__button"
          key={option}
          onClick={() => setLanguage(option)}
          type="button"
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
