import { useEffect, useState } from "react";
import type { MotionPreference } from "../hooks/use-motion-preference";
import { MotionPreferenceToggle } from "./motion-preference-toggle";

type SiteHeaderProps = {
  readonly motionPreference: MotionPreference;
};

const navigationItems = [
  { href: "#work", id: "work", label: "Work" },
  { href: "#archive", id: "archive", label: "Archive" },
  { href: "#principles", id: "principles", label: "Principles" },
  { href: "#about", id: "about", label: "About" },
] as const;

function getSectionFromHash(): string | undefined {
  if (typeof window === "undefined") return undefined;

  const sectionId = window.location.hash.slice(1);
  return navigationItems.some((item) => item.id === sectionId) ? sectionId : undefined;
}

export function SiteHeader({ motionPreference }: SiteHeaderProps) {
  const [activeSection, setActiveSection] = useState<string | undefined>(getSectionFromHash);

  useEffect(() => {
    const sections = navigationItems
      .map((item) => document.getElementById(item.id))
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
        <a className="wordmark" href="#main-content" aria-label="Nguyen Son home">
          nguyen_son
        </a>
        <nav aria-label="Primary navigation" className="site-navigation">
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
        <MotionPreferenceToggle preference={motionPreference} />
      </div>
    </header>
  );
}
