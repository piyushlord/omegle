import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { ChatMessage } from "@/hooks/useMatchmaking";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function ChatPanel({ messages, onSend, disabled }: ChatPanelProps) {
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-ink-900/60 backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-accent-400" />
        <h3 className="text-sm font-semibold text-white">Chat</h3>
        <span className="ml-auto text-xs text-slate-500">
          Messages disappear when you skip
        </span>
      </div>

      <div ref={listRef} className="flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-sm text-slate-500">
              Say hello to your stranger.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                  m.from === "me"
                    ? "bg-brand-500 text-ink-950 rounded-br-md"
                    : "bg-white/[0.06] text-slate-100 rounded-bl-md border border-white/10"
                }`}
              >
                <p className="break-words">{m.text}</p>
                <span
                  className={`mt-1 block text-[10px] ${
                    m.from === "me" ? "text-ink-900/60" : "text-slate-500"
                  }`}
                >
                  {new Date(m.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={submit} className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={disabled ? "Connect to chat..." : "Type a message..."}
            disabled={disabled}
            maxLength={500}
            className="input flex-1 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={disabled || !text.trim()}
            className="btn h-10 w-10 rounded-xl bg-brand-500 text-ink-950 hover:bg-brand-400 disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
