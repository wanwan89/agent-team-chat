"use client";

import { useRef, useState } from "react";
import AgentRoster, { AgentStatus } from "@/components/AgentRoster";
import { UserMessage, AgentMessage } from "@/components/MessageBubble";
import { AGENT_ORDER, AgentId, AgentStreamEvent } from "@/lib/agents";

type Turn =
  | { kind: "user"; text: string }
  | { kind: "agent"; agent: AgentId; content: string; isThinking?: boolean };

const initialStatuses: Record<AgentId, AgentStatus> = {
  planner: "idle",
  coder: "idle",
  reviewer: "idle",
};

export default function Page() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [statuses, setStatuses] = useState<Record<AgentId, AgentStatus>>(initialStatuses);
  const [isBusy, setIsBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || isBusy) return;

    setInput("");
    setIsBusy(true);
    setStatuses({ planner: "idle", coder: "idle", reviewer: "idle" });
    setTurns((prev) => [...prev, { kind: "user", text }]);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.body) throw new Error("Tidak ada respons dari server");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event: AgentStreamEvent = JSON.parse(line);
          handleEvent(event);
        }
      }
    } catch (err) {
      setTurns((prev) => [
        ...prev,
        {
          kind: "agent",
          agent: "reviewer",
          content: `Gagal menghubungi tim agent: ${
            err instanceof Error ? err.message : "unknown error"
          }`,
        },
      ]);
    } finally {
      setIsBusy(false);
      scrollToBottom();
    }
  }

  function handleEvent(event: AgentStreamEvent) {
    if (event.type === "agent_start") {
      setStatuses((prev) => ({ ...prev, [event.agent]: "thinking" }));
      setTurns((prev) => [
        ...prev,
        { kind: "agent", agent: event.agent, content: "", isThinking: true },
      ]);
    } else if (event.type === "agent_result") {
      setStatuses((prev) => ({ ...prev, [event.agent]: "done" }));
      setTurns((prev) => {
        const next = [...prev];
        const idx = next.findLastIndex(
          (t) => t.kind === "agent" && t.agent === event.agent && t.isThinking
        );
        if (idx !== -1) {
          next[idx] = { kind: "agent", agent: event.agent, content: event.content };
        }
        return next;
      });
    } else if (event.type === "error") {
      setTurns((prev) => [
        ...prev,
        { kind: "agent", agent: "reviewer", content: `Error: ${event.message}` },
      ]);
    }
    scrollToBottom();
  }

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <AgentRoster statuses={statuses} />

      <div className="flex flex-1 flex-col">
        <header className="border-b border-line px-6 py-5">
          <h1 className="font-display text-2xl text-ink">Agent Team Chat</h1>
          <p className="mt-1 text-sm text-inkMuted">
            Kirim satu permintaan, tiga agent mengerjakannya secara berurutan.
          </p>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {turns.length === 0 && (
            <p className="text-sm text-inkMuted">
              Belum ada obrolan. Coba tulis satu permintaan di bawah, misalnya
              &ldquo;buat fungsi validasi nomor telepon Indonesia&rdquo;.
            </p>
          )}

          {turns.map((turn, i) =>
            turn.kind === "user" ? (
              <UserMessage key={i} text={turn.text} />
            ) : (
              <AgentMessage
                key={i}
                agent={turn.agent}
                content={turn.content}
                isThinking={turn.isThinking}
              />
            )
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-3 border-t border-line px-6 py-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis permintaanmu…"
            disabled={isBusy}
            className="flex-1 rounded-md bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-inkMuted focus:outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isBusy || !input.trim()}
            className="rounded-md bg-planner px-5 py-3 text-sm font-medium text-base disabled:opacity-40"
          >
            {isBusy ? "Diproses…" : "Kirim"}
          </button>
        </form>
      </div>
    </main>
  );
}
