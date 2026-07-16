import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./app";
import { publicProjectArchive } from "./content/public-project-archive";
import { selectedProjects } from "./content/portfolio-data";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.lang = "en";
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
    expect(screen.getByText(/learn deliberately\. build in public/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "View repository" })).toHaveLength(
      selectedProjects.length + publicProjectArchive.length,
    );
    expect(screen.getByRole("heading", { name: /19 public projects/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open sơn ai portfolio chatbot/i })).toBeInTheDocument();
    expect(container.querySelector(".studio-scene-fallback")).toBeInTheDocument();
  });

  it("lets a visitor reduce optional motion", () => {
    render(<App />);

    const button = screen.getByRole("button", { name: "Reduce motion" });
    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAccessibleName("Motion reduced");
  });

  it("switches the public interface to Vietnamese and remembers the selection", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Vietnamese" }));

    expect(document.documentElement).toHaveAttribute("lang", "vi");
    expect(window.localStorage.getItem("nguyen-son-portfolio-language")).toBe("vi");
    expect(document.title).toBe("Nguyễn Sơn | Sinh viên CNTT · Software & DevOps");
    expect(screen.getByText("Học có mục tiêu. Xây từng bước.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /19 dự án công khai/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Xem repository" })).toHaveLength(
      selectedProjects.length + publicProjectArchive.length,
    );
    expect(screen.getByRole("button", { name: "Mở chatbot portfolio Sơn AI" })).toBeInTheDocument();
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
