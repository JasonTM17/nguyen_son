import { HeroSection } from "./components/hero-section";
import { PrinciplesSection } from "./components/principles-section";
import { PublicProjectArchiveSection } from "./components/public-project-archive-section";
import { SelectedWorkSection } from "./components/selected-work-section";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { profileLinks } from "./content/portfolio-data";
import { PortfolioAssistant } from "./features/portfolio-assistant/portfolio-assistant";
import { useMotionPreference } from "./hooks/use-motion-preference";

function App() {
  const motionPreference = useMotionPreference();
  const githubLink = profileLinks[0];

  return (
    <div className="page-shell" data-reduce-motion={motionPreference.reduceMotion}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader motionPreference={motionPreference} />
      <main id="main-content">
        <HeroSection motionPreference={motionPreference} />
        <SelectedWorkSection />
        <PublicProjectArchiveSection />
        <PrinciplesSection />
        <section className="section section--about" id="about" aria-labelledby="about-heading">
          <div className="section-heading">
            <p className="eyebrow">Learning in public</p>
            <h2 id="about-heading">Learning by building systems that people can actually use.</h2>
          </div>
          <div className="about-copy">
            <p>
              I am a student developer learning through real repositories — shipping small improvements,
              revisiting assumptions, and asking for feedback along the way.
            </p>
            <p>
              Each project is part of an ongoing path across web, mobile, AI, DevOps, Java, and systems
              engineering. I welcome thoughtful suggestions that help make the next iteration clearer.
            </p>
            <a className="text-link" href={githubLink.href} target="_blank" rel="noreferrer">
              Explore the full GitHub profile
            </a>
          </div>
        </section>
      </main>
      <SiteFooter githubLink={githubLink} />
      <PortfolioAssistant />
    </div>
  );
}

export default App;
