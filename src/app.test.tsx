import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./app";
import { selectedProjects } from "./content/portfolio-data";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: defaultMatchMedia,
    writable: true,
  });
});

const defaultMatchMedia = window.matchMedia;

function createMediaQueryList(matches: boolean): MediaQueryList {
  return {
    matches,
    media: "",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;
}

describe("App", () => {
  it("renders the primary content and selected projects without a canvas", () => {
    const { container } = render(<App />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/nguyen son/i);
    expect(screen.getByText(/build reliably\. ship deliberately/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "View repository" })).toHaveLength(
      selectedProjects.length,
    );
    expect(container.querySelector(".studio-scene-fallback")).toBeInTheDocument();
  });

  it("lets a visitor reduce optional motion", () => {
    render(<App />);

    const button = screen.getByRole("button", { name: "Reduce motion" });
    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAccessibleName("Motion reduced");
  });

  it("keeps operating-system reduced motion as the lower bound", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockImplementation((query: string) =>
        createMediaQueryList(query === "(prefers-reduced-motion: reduce)"),
      ),
      writable: true,
    });

    render(<App />);

    const button = screen.getByRole("button", { name: "Motion reduced" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toBeDisabled();
  });

  it("renders content when matchMedia is unavailable", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: undefined,
      writable: true,
    });

    render(<App />);

    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
