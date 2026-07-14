import type { ExternalLink } from "../types/portfolio";

type SiteFooterProps = {
  readonly githubLink: ExternalLink;
};

export function SiteFooter({ githubLink }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div>
        <p className="eyebrow">Keep in touch</p>
        <h2>Follow the next build.</h2>
      </div>
      <a className="button button--primary" href={githubLink.href} target="_blank" rel="noreferrer">
        Visit GitHub
      </a>
      <p className="site-footer__note">Nguyen Son / a static portfolio with an optional 3D layer.</p>
    </footer>
  );
}
