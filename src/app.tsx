import { HeroSection } from "./components/hero-section";
import { PrinciplesSection } from "./components/principles-section";
import { SelectedWorkSection } from "./components/selected-work-section";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { profileLinks } from "./content/portfolio-data";
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
        <PrinciplesSection />
        <section className="section section--about" id="about" aria-labelledby="about-heading">
          <div className="section-heading">
            <p className="eyebrow">About the work</p>
            <h2 id="about-heading">Products are better when every layer has a purpose.</h2>
          </div>
          <div className="about-copy">
            <p>
              Nguyen Son&apos;s public work spans operations platforms, cross-platform mobile apps,
              real-time delivery workflows, and AI-assisted systems connected to physical devices.
            </p>
            <p>
              The common thread is practical: make the complex path clearer for the person who has
              to use, operate, or extend it next.
            </p>
            <a className="text-link" href={githubLink.href} target="_blank" rel="noreferrer">
              Explore the full GitHub profile
            </a>
          </div>
        </section>
      </main>
      <SiteFooter githubLink={githubLink} />
    </div>
  );
}

export default App;
