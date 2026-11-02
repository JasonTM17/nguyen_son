import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { publicProjectArchive } from "../content/public-project-archive";
import { PortfolioLanguageProvider } from "../i18n/portfolio-language";
import { PublicProjectArchiveSection } from "./public-project-archive-section";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("public project archive discovery", () => {
  it("reveals every project in six-card batches and resets focus to search", () => {
    const { container } = render(<PublicProjectArchiveSection />);
    expect(container.querySelectorAll(".archive-card")).toHaveLength(6);
    const showMore = screen.getByRole("button", { name: "Show 6 more projects" });
    fireEvent.click(showMore);
    expect(container.querySelectorAll(".archive-card")).toHaveLength(12);
    expect(screen.getByRole("button", { name: "Show 6 more projects" })).toBe(showMore);
    fireEvent.click(showMore);
    expect(container.querySelectorAll(".archive-card")).toHaveLength(18);
    expect(showMore).toHaveAccessibleName("Show 1 more project");
    fireEvent.click(showMore);
    expect(container.querySelectorAll(".archive-card")).toHaveLength(publicProjectArchive.length);
    expect(showMore).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Reset view" }));
    expect(container.querySelectorAll(".archive-card")).toHaveLength(6);
    expect(screen.getByRole("searchbox")).toHaveFocus();
  });

  it("finds undisplayed projects and combines technology with search", () => {
    const { container } = render(<PublicProjectArchiveSection />);
    const lastProject = publicProjectArchive.at(-1)!;
    expect(screen.queryByRole("heading", { name: lastProject.title })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: lastProject.title } });
    expect(screen.getByRole("heading", { name: lastProject.title })).toBeInTheDocument();
    expect(container.querySelectorAll(".archive-card")).toHaveLength(1);
    fireEvent.change(screen.getByRole("combobox", { name: "Technology" }), { target: { value: "Python" } });
    expect(screen.getByRole("heading", { name: lastProject.title })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Flutter" } });
    expect(container.querySelectorAll(".archive-card")).toHaveLength(0);
    expect(screen.getByText(/no matching projects/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reset view" }));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Python" } });
    expect(container.querySelectorAll(".archive-card").length).toBeGreaterThan(0);
    for (const card of container.querySelectorAll(".archive-card")) expect(card).toHaveTextContent("Python");
  });

  it("supports unaccented Vietnamese search and keeps canonical numbering", () => {
    window.localStorage.setItem("nguyen-son-portfolio-language", "vi");
    const { container } = render(<PortfolioLanguageProvider><PublicProjectArchiveSection /></PortfolioLanguageProvider>);
    fireEvent.change(screen.getByRole("searchbox", { name: "Tìm dự án công khai" }), { target: { value: "dai hoc" } });
    expect(screen.getByRole("heading", { name: "CampusCore" })).toBeInTheDocument();
    expect(container.querySelector(".archive-card__meta span")).toHaveTextContent("08");
    expect(screen.getByRole("status")).toHaveTextContent("1 / 1");
    fireEvent.click(screen.getByRole("button", { name: "Đặt lại bộ lọc" }));
    expect(screen.getByRole("button", { name: "Xem thêm 6 dự án" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Công nghệ" })).toHaveValue("");
  });
});
