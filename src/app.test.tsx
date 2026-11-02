import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./app";
import { publicProjectArchive } from "./content/public-project-archive";
import pinnedSnapshot from "./content/pinned-projects.json";

beforeEach(() => { vi.spyOn(Date, "now").mockReturnValue(Date.parse(pinnedSnapshot.verifiedAt)); });

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
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
  it("filters the archive by technology and restores all projects when cleared", () => {
    render(<App />);
    const search = screen.getByRole("searchbox", { name: "Search public projects" });
    const archive = document.getElementById("archive")!;
    const originalCount = archive.querySelectorAll(".archive-card").length;
    fireEvent.change(search, { target: { value: "Fastify" } });
    expect(archive.querySelectorAll(".archive-card").length).toBeGreaterThan(0);
    expect(archive.querySelectorAll(".archive-card").length).toBeLessThan(originalCount);
    expect(archive.querySelector(".archive-card")).toHaveTextContent(/fastify/i);
    fireEvent.change(search, { target: { value: "no-such-project-123" } });
    expect(archive.querySelectorAll(".archive-card")).toHaveLength(0);
    expect(screen.getByText(/no matching projects yet/i)).toBeInTheDocument();
    fireEvent.change(search, { target: { value: "" } });
    expect(archive.querySelectorAll(".archive-card")).toHaveLength(originalCount);
  });

  it("renders the primary content and selected projects without a canvas", () => {
    const { container } = render(<App />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/nguyen son/i);
    expect(screen.getByText(/learn deliberately\. build in public/i)).toBeInTheDocument();
    while (screen.queryByRole("button", { name: /^show \d+ more projects?$/i })) {
      fireEvent.click(screen.getByRole("button", { name: /^show \d+ more projects?$/i }));
    }
    expect(screen.getAllByRole("link", { name: "View repository" })).toHaveLength(
      pinnedSnapshot.repositories.length + publicProjectArchive.length,
    );
    expect(screen.getByRole("heading", { name: /19 public projects/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open ai assistant/i })).toBeInTheDocument();
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
    while (screen.queryByRole("button", { name: /^xem thêm \d+ dự án$/i })) {
      fireEvent.click(screen.getByRole("button", { name: /^xem thêm \d+ dự án$/i }));
    }
    expect(screen.getAllByRole("link", { name: "Xem repository" })).toHaveLength(
      pinnedSnapshot.repositories.length + publicProjectArchive.length,
    );
    expect(screen.getByRole("button", { name: "Mở Trợ lí AI" })).toBeInTheDocument();
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
