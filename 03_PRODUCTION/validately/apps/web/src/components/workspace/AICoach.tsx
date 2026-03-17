"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useProjectStore } from "@/store/useProjectStore";
import { GENIE_TRIGGERS, AI_SYS } from "@validately/shared";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AICoachProps {
  show: boolean;
  onToggle: () => void;
}

export function AICoach({ show, onToggle }: AICoachProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data, stageIdx } = useProjectStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && show) onToggle();
    },
    [show, onToggle]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    // Check genie triggers (instant client-side responses)
    const trigger = GENIE_TRIGGERS.find(
      (t) => t.stage === stageIdx && t.pattern.test(text)
    );
    if (trigger) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: trigger.msg },
      ]);
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt: AI_SYS,
          context: {
            stage: stageIdx,
            startupName: data.startup_name || "Unnamed",
          },
        }),
      });
      if (!res.ok) throw new Error("AI request failed");
      const json = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: json.content },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Connection issue. Check your API key in Settings, or try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /**
   * FIX P1: Public method for per-field AI review.
   * Called by FieldInput "AI Review" button.
   */
  function askAboutField(fieldLabel: string, value: string) {
    const prompt = `Review my "${fieldLabel}" field:\n\n"${value.substring(0, 500)}"\n\nIs this specific enough? What's missing? Challenge my assumptions.`;
    setInput(prompt);
    if (!show) onToggle();
    // Auto-send after a small delay for better UX
    setTimeout(() => {
      const userMsg: Message = { role: "user", content: prompt };
      // Use functional updater to get fresh messages, then fire API call outside
      let snapshot: Message[] = [];
      setMessages((prev) => {
        snapshot = [...prev, userMsg];
        return snapshot;
      });
      setInput("");
      setLoading(true);

      apiFetch("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: snapshot.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt: AI_SYS,
          context: {
            stage: stageIdx,
            startupName: data.startup_name || "Unnamed",
          },
        }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error();
          const json = await res.json();
          setMessages((m) => [
            ...m,
            { role: "assistant", content: json.content },
          ]);
        })
        .catch(() => {
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              content: "Connection issue. Check your API key in Settings.",
            },
          ]);
        })
        .finally(() => setLoading(false));
    }, 100);
  }

  // Expose askAboutField via a ref-like pattern on the window for cross-component access
  const askAboutFieldRef = useRef(askAboutField);
  askAboutFieldRef.current = askAboutField;

  useEffect(() => {
    const handler = (...args: Parameters<typeof askAboutField>) =>
      askAboutFieldRef.current(...args);
    (window as any).__aiCoachAskField = handler;
    return () => {
      delete (window as any).__aiCoachAskField;
    };
  }, []);

  return (
    <>
      {/* Mobile FAB — FIX P2: moved up to avoid textarea overlap */}
      <button
        onClick={onToggle}
        className="fixed bottom-20 right-5 w-12 h-12 rounded-full bg-brand text-white text-lg font-bold shadow-lg hover:bg-brand-hover z-50 md:hidden transition-transform"
        aria-label="Toggle AI Coach"
      >
        {show ? "\u2715" : "AI"}
      </button>

      {show && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`${
          show ? "translate-x-0" : "translate-x-full md:translate-x-0"
        } fixed md:relative right-0 top-0 h-full w-[300px] bg-surface-1 border-l border-border flex flex-col transition-transform z-40`}
      >
        <div className="p-3 border-b border-border flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-sm font-bold">AI Coach</div>
            <div className="text-[10px] text-content-subtle">
              Brutally honest startup advisor
            </div>
          </div>
          <button
            onClick={onToggle}
            aria-label="Close AI Coach"
            className="text-content-subtle hover:text-content text-lg md:hidden"
          >
            \u2715
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-[11px] text-content-subtle text-center mt-8">
              Ask me anything about your startup.
              <br />I will challenge your assumptions.
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`text-[12px] leading-relaxed p-2.5 rounded-lg ${
                msg.role === "user"
                  ? "bg-brand/10 text-content ml-6"
                  : "bg-surface-2 text-content mr-6"
              }`}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="text-[11px] text-content-subtle animate-pulse">
              Thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-3 border-t border-border flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask your AI coach..."
              className="flex-1 py-2 px-3 rounded-lg bg-surface text-content border border-border text-[12px] focus:border-brand focus:outline-none transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-3 py-2 rounded-lg bg-brand text-white text-[12px] font-bold hover:bg-brand-hover disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
