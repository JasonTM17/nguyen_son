import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PortfolioAssistant } from "./portfolio-assistant";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe("PortfolioAssistant", () => {
  it("sends a question to the server-side portfolio assistant and renders its grounded reply", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ answer: "DevHire Cloud is the strongest Java and DevOps example.", sources: ["DevHire Cloud project"] }),
      ok: true,
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<PortfolioAssistant />);

    fireEvent.click(screen.getByRole("button", { name: /ask son's guide/i }));
    fireEvent.change(screen.getByLabelText(/ask about nguyen son's portfolio/i), { target: { value: "Which project uses Java?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText(/devhire cloud is the strongest java/i)).toBeInTheDocument();
    expect(screen.getByText(/grounded in: devhire cloud project/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/chat", expect.objectContaining({ method: "POST" }));
  });

  it("moves focus into the assistant and returns it to the launcher when closed", async () => {
    render(<PortfolioAssistant />);
    const launcher = screen.getByRole("button", { name: /ask son's guide/i });

    fireEvent.click(launcher);
    expect(await screen.findByLabelText(/ask about nguyen son's portfolio/i)).toHaveFocus();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(launcher).toHaveFocus());
  });

  it("restores the browser question budget when an unavailable API response has no quota value", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<PortfolioAssistant />);

    fireEvent.click(screen.getByRole("button", { name: /ask son's guide/i }));
    fireEvent.change(screen.getByLabelText(/ask about nguyen son's portfolio/i), { target: { value: "Which project uses Java?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText(/temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/75 of 75 questions remain/i)).toBeInTheDocument();
  });
});
