import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AssistantAnswer } from "./assistant-answer";

afterEach(cleanup);

describe("plain-text assistant answer layout", () => {
  it("separates introductory paragraphs and numbered projects without losing order", () => {
    const { container } = render(<AssistantAnswer content={"Dữ liệu đã xác minh.\n\nTheo thứ tự ghim:\n\n1. HealthCare — Spring Boot\n2. CampusUTE — Next.js\n3. BookStore — Java"} />);
    expect(container.querySelectorAll("p")).toHaveLength(2);
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["HealthCare — Spring Boot", "CampusUTE — Next.js", "BookStore — Java"]);
    expect(container.querySelector("ol")).toHaveAttribute("start", "1");
  });

  it("keeps multiline entries, CRLF and bullet lists readable", () => {
    const { container } = render(<AssistantAnswer content={"Tóm tắt\r\nDòng thứ hai\r\n\r\n- Java\r\nChi tiết Java\r\n- DevOps"} />);
    expect(container.querySelector("p")?.textContent).toBe("Tóm tắt\nDòng thứ hai");
    expect(container.querySelector("ul")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Java\nChi tiết Java", "DevOps"]);
  });

  it("does not mistake version numbers for lists or evaluate HTML and links", () => {
    const text = 'Next.js 16.2 and Spring Boot 4.1\n\n<img src=x onerror=alert(1)> [open](javascript:alert(1))';
    const { container } = render(<AssistantAnswer content={text} />);
    expect(container.querySelector("ol, ul, img, a, script")).not.toBeInTheDocument();
    expect(screen.getByText(/<img src=x/)).toBeInTheDocument();
  });

  it("retains explicit starting numbers and separates nonconsecutive numbering", () => {
    const { container } = render(<AssistantAnswer content={"3) Three\n4) Four\n8) Eight"} />);
    expect([...container.querySelectorAll("ol")].map((list) => list.start)).toEqual([3, 8]);
  });
});
