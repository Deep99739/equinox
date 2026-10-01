import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowUp, Plus, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getThread,
  saveThread,
  sendChatMessage,
  type AgentType,
  type ChatMessage,
} from "../../api/chatApi";
import { getUserEmail } from "../../utils/authUtils";

const prompts = [
  "What tasks are still open?",
  "Help me plan my day",
  "How can I manage my energy today?",
];
export default function ChatPage() {
  const { email: routeEmail, threadId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [agent, setAgent] = useState<AgentType>("supervisor");
  const [sending, setSending] = useState(false);
  const [loadingThread, setLoadingThread] = useState(true);
  const [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const email = getUserEmail();

  useEffect(() => {
    if (!email) {
      navigate("/", { replace: true });
      return;
    }
    if (!threadId || routeEmail !== email) {
      navigate(`/chat/${encodeURIComponent(email)}/${crypto.randomUUID()}`, {
        replace: true,
      });
      return;
    }
    let active = true;
    getThread(email, threadId)
      .then((data) => {
        if (active) setMessages(data.messages || []);
      })
      .catch(() => {
        if (active) setMessages([]);
      })
      .finally(() => {
        if (active) setLoadingThread(false);
      });
    return () => {
      active = false;
    };
  }, [email, routeEmail, threadId, navigate]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "instant" });
  }, [messages, sending]);
  useEffect(() => {
    if (textarea.current) {
      textarea.current.style.height = "auto";
      textarea.current.style.height = `${Math.min(textarea.current.scrollHeight, 180)}px`;
    }
  }, [input]);
  function newChat() {
    if (email)
      navigate(`/chat/${encodeURIComponent(email)}/${crypto.randomUUID()}`);
  }
  async function send() {
    const text = input.trim();
    if (!text || sending || !email || !threadId) return;
    setError("");
    setInput("");
    setSending(true);
    const userMessage: ChatMessage = { id: Date.now(), sender: "user", text };
    const next = [...messages, userMessage];
    setMessages(next);
    try {
      const result = await sendChatMessage(text, agent, email, threadId);
      const reply = result.response || result.summary || result.reply;
      if (!reply) throw new Error("Empty reply");
      const complete = [
        ...next,
        { id: Date.now() + 1, sender: "bot", text: reply },
      ];
      setMessages(complete);
      try {
        await saveThread(
          email,
          threadId,
          complete,
          complete[0]?.text.slice(0, 48) || "Conversation",
        );
      } catch {
        setError(
          "Response received, but this conversation could not be saved.",
        );
      }
    } catch {
      setMessages(messages);
      setInput(text);
      setError("Could not send your message. Please try again.");
    } finally {
      setSending(false);
    }
  }
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  }
  return (
    <div className="chat-page">
      <div className="chat-header">
        <div>
          <p className="eyebrow">Your assistant</p>
          <h1>
            Ask Equinox<span className="heading-dot">.</span>
          </h1>
        </div>
        <button
          type="button"
          className="button button-secondary"
          onClick={newChat}
        >
          <Plus size={17} /> New chat
        </button>
      </div>
      <div className="chat-stream" aria-live="polite">
        {loadingThread ? (
          <p className="muted-line" role="status">
            Opening conversation…
          </p>
        ) : messages.length === 0 ? (
          <div className="chat-welcome">
            <span className="assistant-mark">
              <Sparkles size={23} />
            </span>
            <h2>Where can I help today?</h2>
            <p>
              Ask about your plans, tasks, or how you’re feeling. Start wherever
              you are.
            </p>
            <div className="prompt-list">
              {prompts.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() => {
                    setInput(prompt);
                    textarea.current?.focus();
                  }}
                >
                  {prompt}
                  <span>↗</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${message.sender === "user" ? "from-user" : "from-assistant"}`}
              >
                <span className="message-author">
                  {message.sender === "user" ? "You" : "Equinox"}
                </span>
                <div className="message-body">
                  {message.sender === "user" ? (
                    message.text
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="chat-message from-assistant">
                <span className="message-author">Equinox</span>
                <div className="typing-dots" aria-label="Equinox is responding">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            )}
            <div ref={bottom} />
          </div>
        )}
      </div>
      <div className="chat-composer-wrap">
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        <div className="chat-composer">
          <label className="sr-only" htmlFor="chat-message">
            Message
          </label>
          <textarea
            ref={textarea}
            id="chat-message"
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything about your day…"
            disabled={loadingThread || sending}
          />
          <div className="composer-bottom">
            <label className="agent-select-label" htmlFor="chat-agent">
              Assistant{" "}
              <select
                id="chat-agent"
                value={agent}
                onChange={(event) => setAgent(event.target.value as AgentType)}
              >
                <option value="supervisor">General</option>
                <option value="wellness">Wellness</option>
              </select>
            </label>
            <button
              type="button"
              className="composer-send"
              aria-label="Send message"
              onClick={() => void send()}
              disabled={!input.trim() || sending || loadingThread}
            >
              <ArrowUp size={19} />
            </button>
          </div>
        </div>
        <p className="chat-note">
          Equinox can make mistakes. Check important information.
        </p>
      </div>
    </div>
  );
}
