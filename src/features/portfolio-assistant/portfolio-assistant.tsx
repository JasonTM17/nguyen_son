import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { askPortfolioAssistant, PortfolioAssistantApiError } from "./portfolio-assistant-api";
import {
  consumeQuestion,
  getPortfolioAssistantSessionId,
  getRemainingQuestions,
  portfolioAssistantQuestionLimit,
  restoreRemainingQuestions,
} from "./portfolio-assistant-storage";
import type { PortfolioAssistantMessage } from "./portfolio-assistant-types";

const WELCOME_MESSAGE: PortfolioAssistantMessage = {
  content: "Hi — I’m Son’s portfolio guide. Ask me about projects, Java, DevOps, systems, or how Son is learning.",
  id: "welcome",
  role: "assistant",
};

const QUICK_QUESTIONS = ["Which projects use Java?", "What is Son learning right now?"];
let messageSequence = 0;

function createMessage(role: PortfolioAssistantMessage["role"], content: string, sources?: readonly string[]): PortfolioAssistantMessage {
  messageSequence += 1;
  return { content, id: `${role}-${Date.now()}-${messageSequence}`, role, sources };
}

export function PortfolioAssistant() {
  const [draft, setDraft] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<readonly PortfolioAssistantMessage[]>([WELCOME_MESSAGE]);
  const [remaining, setRemaining] = useState(() => getRemainingQuestions());
  const launcherRef = useRef<HTMLButtonElement>(null);
  const messageLogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const messageLog = messageLogRef.current;
    if (typeof messageLog?.scrollTo === "function") {
      messageLog.scrollTo({ top: messageLog.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isSubmitting]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  function closeAssistant(): void {
    setIsOpen(false);
    const restoreLauncherFocus = () => launcherRef.current?.focus();
    if (typeof window.requestAnimationFrame === "function") window.requestAnimationFrame(restoreLauncherFocus);
    else window.setTimeout(restoreLauncherFocus, 0);
  }

  function handlePanelKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (event.key === "Escape") {
      event.preventDefault();
      closeAssistant();
    }
  }

  async function sendQuestion(question: string): Promise<void> {
    const message = question.replace(/\s+/g, " ").trim();
    if (!message || isSubmitting) return;
    if (remaining <= 0) {
      setMessages((current) => [...current, createMessage("assistant", "The 75-question limit for this browser has been reached. Please come back after the daily limit resets.")]);
      return;
    }

    const userMessage = createMessage("user", message);
    const history = [...messages, userMessage];
    const remainingBeforeRequest = remaining;
    setDraft("");
    setMessages(history);
    setRemaining(consumeQuestion());
    setIsSubmitting(true);

    try {
      const reply = await askPortfolioAssistant(message, messages, getPortfolioAssistantSessionId());
      setMessages((current) => [...current, createMessage("assistant", reply.answer, reply.sources)]);
    } catch (error) {
      const apiError = error instanceof PortfolioAssistantApiError ? error : undefined;
      setRemaining(restoreRemainingQuestions(remainingBeforeRequest));
      setMessages((current) => [...current, createMessage("assistant", apiError?.message ?? "The assistant is temporarily unavailable. Please try again shortly.")]);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void sendQuestion(draft);
  }

  return (
    <aside className="portfolio-assistant">
      <button
        aria-controls="portfolio-assistant-panel"
        aria-expanded={isOpen}
        className="portfolio-assistant__launcher"
        onClick={() => (isOpen ? closeAssistant() : setIsOpen(true))}
        ref={launcherRef}
        type="button"
      >
        <span aria-hidden="true">✦</span>
        Ask Son&apos;s guide
      </button>
      {isOpen && (
        <section aria-labelledby="portfolio-assistant-heading" className="portfolio-assistant__panel" id="portfolio-assistant-panel" onKeyDown={handlePanelKeyDown} role="dialog">
          <header className="portfolio-assistant__header">
            <div>
              <p>Grounded portfolio assistant</p>
              <h2 id="portfolio-assistant-heading">Ask about Son&apos;s learning path</h2>
            </div>
            <button aria-label="Close portfolio assistant" className="portfolio-assistant__close" onClick={closeAssistant} type="button">×</button>
          </header>
          <p className="portfolio-assistant__budget">{remaining} of {portfolioAssistantQuestionLimit} questions remain in this browser today.</p>
          <div aria-live="polite" className="portfolio-assistant__messages" ref={messageLogRef} role="log">
            {messages.map((message) => (
              <article className={`portfolio-assistant__message portfolio-assistant__message--${message.role}`} key={message.id}>
                <p>{message.content}</p>
                {message.sources?.length ? <small>Grounded in: {message.sources.join(" · ")}</small> : null}
              </article>
            ))}
            {isSubmitting && <p className="portfolio-assistant__thinking">Checking Son&apos;s portfolio context…</p>}
          </div>
          <div className="portfolio-assistant__quick-questions" aria-label="Suggested questions">
            {QUICK_QUESTIONS.map((question) => <button disabled={isSubmitting || remaining <= 0} key={question} onClick={() => void sendQuestion(question)} type="button">{question}</button>)}
          </div>
          <form className="portfolio-assistant__form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="portfolio-assistant-input">Ask about Nguyen Son&apos;s portfolio</label>
            <textarea disabled={isSubmitting || remaining <= 0} id="portfolio-assistant-input" maxLength={700} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about a project, Java, DevOps, or systems…" ref={inputRef} rows={2} value={draft} />
            <button disabled={!draft.trim() || isSubmitting || remaining <= 0} type="submit">Send</button>
          </form>
        </section>
      )}
    </aside>
  );
}
