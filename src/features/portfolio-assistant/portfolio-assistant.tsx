import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { portfolioCopy } from "../../i18n/portfolio-copy";
import { usePortfolioLanguage, type PortfolioLanguage } from "../../i18n/portfolio-language-context";
import { askPortfolioAssistant, PortfolioAssistantApiError } from "./portfolio-assistant-api";
import {
  consumeQuestion,
  getPortfolioAssistantSessionId,
  getRemainingQuestions,
  portfolioAssistantQuestionLimit,
  restoreRemainingQuestions,
} from "./portfolio-assistant-storage";
import type { PortfolioAssistantMessage } from "./portfolio-assistant-types";

function createWelcomeMessage(language: PortfolioLanguage): PortfolioAssistantMessage {
  return {
    content: portfolioCopy[language].assistant.welcome,
    id: "welcome",
    role: "assistant",
  };
}

let messageSequence = 0;

function createMessage(role: PortfolioAssistantMessage["role"], content: string, sources?: readonly string[]): PortfolioAssistantMessage {
  messageSequence += 1;
  return { content, id: `${role}-${Date.now()}-${messageSequence}`, role, sources };
}

export function PortfolioAssistant() {
  const { language } = usePortfolioLanguage();
  const copy = portfolioCopy[language].assistant;
  const [draft, setDraft] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<readonly PortfolioAssistantMessage[]>(() => [createWelcomeMessage(language)]);
  const [remaining, setRemaining] = useState(() => getRemainingQuestions());
  const launcherRef = useRef<HTMLButtonElement>(null);
  const messageLogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const languageRef = useRef(language);
  const conversationVersionRef = useRef(0);

  useEffect(() => {
    if (languageRef.current === language) return;

    languageRef.current = language;
    conversationVersionRef.current += 1;
    setDraft("");
    setMessages([createWelcomeMessage(language)]);
  }, [language]);

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
      setMessages((current) => [...current, createMessage("assistant", copy.limitReached)]);
      return;
    }

    const userMessage = createMessage("user", message);
    const history = [...messages, userMessage];
    const remainingBeforeRequest = remaining;
    const conversationVersion = conversationVersionRef.current;
    setDraft("");
    setMessages(history);
    setRemaining(consumeQuestion());
    setIsSubmitting(true);

    try {
      const reply = await askPortfolioAssistant(message, messages, getPortfolioAssistantSessionId(), language);
      if (conversationVersion !== conversationVersionRef.current) return;
      setMessages((current) => [...current, createMessage("assistant", reply.answer, reply.sources)]);
    } catch (error) {
      const apiError = error instanceof PortfolioAssistantApiError ? error : undefined;
      setRemaining(restoreRemainingQuestions(remainingBeforeRequest));
      if (conversationVersion !== conversationVersionRef.current) return;
      setMessages((current) => [...current, createMessage("assistant", apiError?.message ?? copy.unavailable)]);
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
        aria-haspopup="dialog"
        aria-label={copy.launcher}
        className="portfolio-assistant__launcher"
        onClick={() => (isOpen ? closeAssistant() : setIsOpen(true))}
        ref={launcherRef}
        type="button"
      >
        <span aria-hidden="true" className="portfolio-assistant__launcher-orb" />
        <span className="portfolio-assistant__launcher-label">{copy.launcher}</span>
      </button>
      {isOpen && (
        <section aria-labelledby="portfolio-assistant-heading" className="portfolio-assistant__panel" id="portfolio-assistant-panel" onKeyDown={handlePanelKeyDown} role="dialog">
          <header className="portfolio-assistant__header">
            <div>
              <p>{copy.panelEyebrow}</p>
              <h2 id="portfolio-assistant-heading">{copy.heading}</h2>
            </div>
            <button aria-label={copy.close} className="portfolio-assistant__close" onClick={closeAssistant} type="button">×</button>
          </header>
          <p className="portfolio-assistant__budget">{copy.budget(remaining, portfolioAssistantQuestionLimit)}</p>
          <div aria-live="polite" className="portfolio-assistant__messages" ref={messageLogRef} role="log">
            {messages.map((message) => (
              <article className={`portfolio-assistant__message portfolio-assistant__message--${message.role}`} key={message.id}>
                <p>{message.content}</p>
                {message.sources?.length ? <small>{copy.sources}: {message.sources.join(" · ")}</small> : null}
              </article>
            ))}
            {isSubmitting && <p className="portfolio-assistant__thinking">{copy.thinking}</p>}
          </div>
          <div className="portfolio-assistant__quick-questions" aria-label={copy.suggestedQuestions}>
            {copy.quickQuestions.map((question) => <button disabled={isSubmitting || remaining <= 0} key={question} onClick={() => void sendQuestion(question)} type="button">{question}</button>)}
          </div>
          <form className="portfolio-assistant__form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="portfolio-assistant-input">{copy.formLabel}</label>
            <textarea disabled={isSubmitting || remaining <= 0} id="portfolio-assistant-input" maxLength={700} onChange={(event) => setDraft(event.target.value)} placeholder={copy.placeholder} ref={inputRef} rows={2} value={draft} />
            <button disabled={!draft.trim() || isSubmitting || remaining <= 0} type="submit">{copy.send}</button>
          </form>
        </section>
      )}
    </aside>
  );
}
