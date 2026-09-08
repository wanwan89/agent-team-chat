import { AGENTS, AgentId } from "@/lib/agents";

const colorClasses: Record<string, string> = {
  planner: "text-planner border-planner/30 bg-planner/5",
  coder: "text-coder border-coder/30 bg-coder/5",
  reviewer: "text-reviewer border-reviewer/30 bg-reviewer/5",
};

export function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-lg bg-surfaceRaised px-4 py-3 text-[15px] text-ink">
        {text}
      </div>
    </div>
  );
}

export function AgentMessage({
  agent,
  content,
  isThinking,
}: {
  agent: AgentId;
  content: string;
  isThinking?: boolean;
}) {
  const def = AGENTS[agent];
  const cls = colorClasses[def.color];

  return (
    <div className="flex justify-start">
      <div className={`max-w-[85%] rounded-lg border px-4 py-3 ${cls}`}>
        <div className="mb-1.5 font-mono text-xs opacity-80">{def.label}</div>
        {isThinking ? (
          <p className="text-sm text-inkMuted">Sedang menyusun jawaban…</p>
        ) : (
          <p className="whitespace-pre-wrap text-[15px] text-ink">{content}</p>
        )}
      </div>
    </div>
  );
}
