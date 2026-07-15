import type { ExternalLink } from "../types/portfolio";
import { portfolioCopy } from "../i18n/portfolio-copy";
import { usePortfolioLanguage } from "../i18n/portfolio-language-context";

type SiteFooterProps = {
  readonly githubLink: ExternalLink;
};

export function SiteFooter({ githubLink }: SiteFooterProps) {
  const { language } = usePortfolioLanguage();
  const copy = portfolioCopy[language].footer;

  return (
    <footer className="site-footer">
      <div>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2>{copy.heading}</h2>
      </div>
      <a className="button button--primary" href={githubLink.href} target="_blank" rel="noreferrer">
        {copy.visitGithub}
      </a>
      <p className="site-footer__note">{copy.note}</p>
    </footer>
  );
}
