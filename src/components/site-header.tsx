import { useEffect, useState } from "react";
import type { MotionPreference } from "../hooks/use-motion-preference";
import { portfolioCopy } from "../i18n/portfolio-copy";
import { usePortfolioLanguage } from "../i18n/portfolio-language-context";
import { LanguageToggle } from "./language-toggle";
import { MotionPreferenceToggle } from "./motion-preference-toggle";

type SiteHeaderProps = {
  readonly motionPreference: MotionPreference;
};

const navigationIds = ["work", "archive", "principles", "about"] as const;

function getSectionFromHash(): string | undefined {
  if (typeof window === "undefined") return undefined;

  const sectionId = window.location.hash.slice(1);
  return navigationIds.includes(sectionId as (typeof navigationIds)[number]) ? sectionId : undefined;
}

export function SiteHeader({ motionPreference }: SiteHeaderProps) {
  const [activeSection, setActiveSection] = useState<string | undefined>(getSectionFromHash);
  const { language } = usePortfolioLanguage();
  const copy = portfolioCopy[language];
  const navigationItems = [
    { href: "#work", id: "work", label: copy.navigation.work },
    { href: "#archive", id: "archive", label: copy.navigation.archive },
    { href: "#principles", id: "principles", label: copy.navigation.principles },
    { href: "#about", id: "about", label: copy.navigation.about },
  ] as const;

  useEffect(() => {
    const sections = navigationIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    const updateActiveSection = () => {
      const readingLine = window.innerHeight * 0.38;
      const currentSection = sections.reduce<string | undefined>(
        (active, section) => (section.getBoundingClientRect().top <= readingLine ? section.id : active),
        undefined,
      );

      setActiveSection(currentSection);
    };

    const observer = typeof IntersectionObserver === "undefined"
      ? undefined
      : new IntersectionObserver(updateActiveSection, { rootMargin: "-16% 0px -58% 0px" });

    sections.forEach((section) => observer?.observe(section));
    window.addEventListener("hashchange", updateActiveSection);
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    updateActiveSection();

    return () => {
      observer?.disconnect();
      window.removeEventListener("hashchange", updateActiveSection);
      window.removeEventListener("scroll", updateActiveSection);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="wordmark" href="#main-content" aria-label={copy.homeLabel}>
          nguyen_son
        </a>
        <nav aria-label={copy.navigationLabel} className="site-navigation">
          {navigationItems.map((item) => (
            <a
              aria-current={activeSection === item.id ? "location" : undefined}
              href={item.href}
              key={item.id}
              onClick={() => setActiveSection(item.id)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="site-header__controls">
          <LanguageToggle />
          <MotionPreferenceToggle preference={motionPreference} />
        </div>
      </div>
    </header>
  );
}
