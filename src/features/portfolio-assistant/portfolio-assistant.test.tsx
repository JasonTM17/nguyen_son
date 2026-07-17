import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PortfolioLanguageProvider } from "../../i18n/portfolio-language";
import { LanguageToggle } from "../../components/language-toggle";
import { PortfolioAssistant } from "./portfolio-assistant";
import { consumeQuestion, portfolioAssistantQuestionLimit } from "./portfolio-assistant-storage";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe("PortfolioAssistant", () => {
  it("keeps the cute Sơn AI identity and chatbot purpose visible before opening", () => {
    render(<PortfolioAssistant />);
    const launcher = screen.getByRole("button", { name: /open sơn ai portfolio chatbot/i });

    expect(within(launcher).getByText("Sơn AI")).toBeVisible();
    expect(within(launcher).getByText("Portfolio chatbot")).toBeVisible();
  });

  it("keeps an exhausted assistant operable without exposing a running counter", async () => {
    for (let index = 0; index < portfolioAssistantQuestionLimit; index += 1) consumeQuestion();
    render(<PortfolioAssistant />);

    const launcher = screen.getByRole("button", { name: /open sơn ai portfolio chatbot/i });
    fireEvent.click(launcher);

    expect(screen.getByRole("status")).toHaveTextContent(/75-question limit/i);
    expect(screen.queryByText(/questions remain/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/ask about nguyen son's portfolio/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /close/i })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(launcher).toHaveFocus());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("explains the limit after the final available question succeeds", async () => {
    for (let index = 1; index < portfolioAssistantQuestionLimit; index += 1) consumeQuestion();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: async () => ({ answer: "DevHire Cloud is a Java learning project.", sources: ["DevHire Cloud project"] }),
      ok: true,
    }));
    render(<PortfolioAssistant />);

    fireEvent.click(screen.getByRole("button", { name: /open sơn ai portfolio chatbot/i }));
    fireEvent.change(screen.getByLabelText(/ask about nguyen son's portfolio/i), { target: { value: "Which project uses Java?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText(/devhire cloud is a java learning project/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/75-question limit/i);
    expect(screen.queryByText(/questions remain/i)).not.toBeInTheDocument();
  });

  it("sends a question to the server-side portfolio assistant and renders its grounded reply", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ answer: "DevHire Cloud is the strongest Java and DevOps example.", sources: ["DevHire Cloud project"] }),
      ok: true,
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<PortfolioAssistant />);

    fireEvent.click(screen.getByRole("button", { name: /open sơn ai portfolio chatbot/i }));
    fireEvent.change(screen.getByLabelText(/ask about nguyen son's portfolio/i), { target: { value: "Which project uses Java?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText(/devhire cloud is the strongest java/i)).toBeInTheDocument();
    expect(screen.getByText(/grounded in: devhire cloud project/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/portfolio-assistant", expect.objectContaining({ method: "POST" }));
  });

  it("moves focus into the assistant and returns it to the launcher when closed", async () => {
    render(<PortfolioAssistant />);
    const launcher = screen.getByRole("button", { name: /open sơn ai portfolio chatbot/i });

    fireEvent.click(launcher);
    expect(await screen.findByLabelText(/ask about nguyen son's portfolio/i)).toHaveFocus();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(launcher).toHaveFocus());
  });

  it("restores the browser question budget when an unavailable API response has no quota value", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<PortfolioAssistant />);

    fireEvent.click(screen.getByRole("button", { name: /open sơn ai portfolio chatbot/i }));
    fireEvent.change(screen.getByLabelText(/ask about nguyen son's portfolio/i), { target: { value: "Which project uses Java?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText(/temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.queryByText(/questions remain/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/ask about nguyen son's portfolio/i)).toBeEnabled();
  });

  it("sends the selected Vietnamese language to the server and localizes the panel", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ answer: "DevHire Cloud là ví dụ học Java và DevOps nổi bật.", sources: ["DevHire Cloud project"] }),
      ok: true,
    });
    window.localStorage.setItem("nguyen-son-portfolio-language", "vi");
    vi.stubGlobal("fetch", fetchMock);
    render(
      <PortfolioLanguageProvider>
        <PortfolioAssistant />
      </PortfolioLanguageProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Mở chatbot portfolio Sơn AI" }));
    expect(screen.getByText(/chào bạn — mình là trợ lý portfolio của sơn/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Hỏi về portfolio của Nguyễn Sơn"), { target: { value: "Dự án nào dùng Java?" } });
    fireEvent.click(screen.getByRole("button", { name: "Gửi" }));

    expect(await screen.findByText(/devhire cloud là ví dụ/i)).toBeInTheDocument();
    const request = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(request.language).toBe("vi");
  });

  it("keeps the fallback error in Vietnamese when an endpoint response is malformed", async () => {
    window.localStorage.setItem("nguyen-son-portfolio-language", "vi");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: async () => ({ answer: " " }),
      ok: true,
    }));
    render(
      <PortfolioLanguageProvider>
        <PortfolioAssistant />
      </PortfolioLanguageProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Mở chatbot portfolio Sơn AI" }));
    fireEvent.change(screen.getByLabelText("Hỏi về portfolio của Nguyễn Sơn"), { target: { value: "Dự án nào dùng Java?" } });
    fireEvent.click(screen.getByRole("button", { name: "Gửi" }));

    expect(await screen.findByText("Trợ lý tạm thời chưa phản hồi được. Vui lòng thử lại sau.")).toBeInTheDocument();
  });

  it("keeps the active request locked while a visitor changes language", async () => {
    let resolveReply: ((value: { json: () => Promise<{ answer: string; sources: string[] }>; ok: boolean }) => void) | undefined;
    const pendingReply = new Promise<{ json: () => Promise<{ answer: string; sources: string[] }>; ok: boolean }>((resolve) => {
      resolveReply = resolve;
    });
    const fetchMock = vi.fn().mockReturnValue(pendingReply);
    vi.stubGlobal("fetch", fetchMock);
    render(
      <PortfolioLanguageProvider>
        <LanguageToggle />
        <PortfolioAssistant />
      </PortfolioLanguageProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open sơn ai portfolio chatbot/i }));
    fireEvent.change(screen.getByLabelText(/ask about nguyen son's portfolio/i), { target: { value: "Which project uses Java?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    fireEvent.click(screen.getByRole("button", { name: "Vietnamese" }));

    const vietnameseQuickQuestion = screen.getByRole("button", { name: "Dự án nào dùng Java?" });
    expect(vietnameseQuickQuestion).toBeDisabled();
    fireEvent.click(vietnameseQuickQuestion);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveReply?.({
      json: async () => ({ answer: "DevHire Cloud is a Java project.", sources: ["DevHire Cloud project"] }),
      ok: true,
    });

    await waitFor(() => expect(vietnameseQuickQuestion).not.toBeDisabled());
    expect(screen.queryByText("DevHire Cloud is a Java project.")).not.toBeInTheDocument();
    expect(screen.getByText(/chào bạn — mình là trợ lý portfolio của sơn/i)).toBeInTheDocument();
  });

  it("restores the local budget when a pending request fails after a language switch", async () => {
    let rejectReply: ((reason?: unknown) => void) | undefined;
    const pendingReply = new Promise<never>((_resolve, reject) => {
      rejectReply = reject;
    });
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pendingReply));
    render(
      <PortfolioLanguageProvider>
        <LanguageToggle />
        <PortfolioAssistant />
      </PortfolioLanguageProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open sơn ai portfolio chatbot/i }));
    fireEvent.change(screen.getByLabelText(/ask about nguyen son's portfolio/i), { target: { value: "Which project uses Java?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    fireEvent.click(screen.getByRole("button", { name: "Vietnamese" }));
    rejectReply?.(new Error("offline"));

    await waitFor(() => expect(screen.getByLabelText("Hỏi về portfolio của Nguyễn Sơn")).toBeEnabled());
    expect(screen.queryByText(/bạn còn .* câu hỏi/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/trợ lý tạm thời/i)).not.toBeInTheDocument();
  });
});
