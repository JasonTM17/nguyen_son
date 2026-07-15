import { HeroSection } from "./components/hero-section";
import { PrinciplesSection } from "./components/principles-section";
import { PublicProjectArchiveSection } from "./components/public-project-archive-section";
import { SelectedWorkSection } from "./components/selected-work-section";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { profileLinks } from "./content/portfolio-data";
import { PortfolioAssistant } from "./features/portfolio-assistant/portfolio-assistant";
import { portfolioCopy } from "./i18n/portfolio-copy";
import { PortfolioLanguageProvider } from "./i18n/portfolio-language";
import { usePortfolioLanguage } from "./i18n/portfolio-language-context";
import { useMotionPreference } from "./hooks/use-motion-preference";

function PortfolioPage() {
  const motionPreference = useMotionPreference();
  const { language } = usePortfolioLanguage();
  const copy = portfolioCopy[language];
  const githubLink = profileLinks[0];

  return (
    <div className="page-shell" data-language={language} data-reduce-motion={motionPreference.reduceMotion}>
      <a className="skip-link" href="#main-content">
        {copy.skipLink}
      </a>
      <SiteHeader motionPreference={motionPreference} />
      <main id="main-content">
        <HeroSection motionPreference={motionPreference} />
        <SelectedWorkSection />
        <PublicProjectArchiveSection />
        <PrinciplesSection />
        <section className="section section--about" id="about" aria-labelledby="about-heading">
          <div className="section-heading">
            <p className="eyebrow">{copy.about.eyebrow}</p>
            <h2 id="about-heading">{copy.about.heading}</h2>
          </div>
          <div className="about-copy">
            {copy.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <a className="text-link" href={githubLink.href} target="_blank" rel="noreferrer">
              {copy.about.profileLink}
            </a>
          </div>
        </section>
      </main>
      <SiteFooter githubLink={githubLink} />
      <PortfolioAssistant />
    </div>
  );
}

export default function App() {
  return (
    <PortfolioLanguageProvider>
      <PortfolioPage />
    </PortfolioLanguageProvider>
  );
}
