import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import snapshot from "../content/pinned-projects.json";
import { usePinnedGithubProjects } from "../hooks/use-pinned-github-projects";
import { SelectedWorkSection } from "./selected-work-section";

vi.mock("../hooks/use-pinned-github-projects", () => ({ usePinnedGithubProjects: vi.fn() }));
beforeEach(() => { vi.mocked(usePinnedGithubProjects).mockReturnValue({ feed: snapshot, isLoading: false, error: false }); });
afterEach(cleanup);

describe("GitHub-pinned featured work", () => {
  it("renders actual pins in GitHub order instead of the fixed four featured projects", () => {
    const { container } = render(<SelectedWorkSection />);
    expect([...container.querySelectorAll(".project-card .text-link")].map((link) => link.getAttribute("href"))).toEqual(snapshot.repositories.map((repo) => repo.href));
    expect(container.querySelectorAll(".project-card")).toHaveLength(6);
    expect(screen.queryByRole("heading", { name: "FoodFlow" })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/following the order on github/i);
  });

  it("shows changed order and an honest empty state when all pins are removed", () => {
    const { container, rerender } = render(<SelectedWorkSection />);
    const repositories = snapshot.repositories.slice(0, 2).reverse();
    vi.mocked(usePinnedGithubProjects).mockReturnValue({ feed: { ...snapshot, repositories }, isLoading: false, error: false });
    rerender(<SelectedWorkSection />);
    expect(container.querySelector(".project-card .project-actions a")).toHaveAttribute("href", repositories[0].href);
    vi.mocked(usePinnedGithubProjects).mockReturnValue({ feed: { ...snapshot, repositories: [] }, isLoading: false, error: false });
    rerender(<SelectedWorkSection />);
    expect(container.querySelectorAll(".project-card")).toHaveLength(0);
    expect(screen.getByText(/no public repositories are currently pinned/i)).toBeInTheDocument();
  });

  it("labels saved pins as stale and provides a profile link when no feed is available", () => {
    vi.mocked(usePinnedGithubProjects).mockReturnValue({ feed: snapshot, isLoading: false, error: true });
    const { rerender } = render(<SelectedWorkSection />);
    expect(screen.getByRole("status")).toHaveTextContent(/saved pins verified/i);
    vi.mocked(usePinnedGithubProjects).mockReturnValue({ feed: null, isLoading: false, error: true });
    rerender(<SelectedWorkSection />);
    expect(screen.getByRole("status")).toHaveTextContent(/temporarily unavailable/i);
    expect(screen.getByRole("link", { name: /view pins on github/i })).toHaveAttribute("href", "https://github.com/JasonTM17");
  });

  it("provides distinct artwork, concise titles and demos only for verified public targets", () => {
    const { container } = render(<SelectedWorkSection />);
    expect([...container.querySelectorAll(".project-card h3")].map((heading) => heading.textContent)).toEqual(["Trash Sorter Pro", "BookStore", "JobHunter", "LaptopShop", "HealthCare", "CampusUTE"]);
    expect(new Set([...container.querySelectorAll('.project-preview img')].map(image => image.getAttribute('src'))).size).toBe(6);
    expect(container.querySelectorAll('.project-preview figcaption a')).toHaveLength(6);
    expect(screen.getAllByText(/Personal project/)).toHaveLength(6);
    expect([...container.querySelectorAll(".project-demo")].map((link) => link.getAttribute("href"))).toEqual(["https://trash-sorter-v2.vercel.app", "https://www.healthcare.id.vn", "https://campusute.io.vn"]);
    expect(screen.getAllByText("Project notes")).toHaveLength(6);
  });

  it("does not lend local editorial facts or demo links to a foreign pin with the same basename", () => {
    const foreign = { ...snapshot.repositories[1], fullName: "other/Ecommerce_BookStore", href: "https://github.com/other/Ecommerce_BookStore", description: "Foreign public project" };
    vi.mocked(usePinnedGithubProjects).mockReturnValue({ feed: { ...snapshot, repositories: [foreign] }, isLoading: false, error: false });
    const { container } = render(<SelectedWorkSection />);
    expect(screen.getByText("Foreign public project")).toBeInTheDocument();
    expect(container.querySelector(".project-artwork--4")).toBeInTheDocument();
    expect(container.querySelector(".project-demo")).not.toBeInTheDocument();
    expect(screen.queryByText("Project notes")).not.toBeInTheDocument();
  });
});
