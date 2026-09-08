import { AGENT_ORDER, AGENTS, AgentId } from "@/lib/agents";

export type AgentStatus = "idle" | "thinking" | "done";

const colorClasses: Record<string, { dot: string; text: string; border: string }> = {
  planner: { dot: "bg-planner", text: "text-planner", border: "border-planner" },
  coder: { dot: "bg-coder", text: "text-coder", border: "border-coder" },
  reviewer: { dot: "bg-reviewer", text: "text-reviewer", border: "border-reviewer" },
};

function StatusDot({ status, color }: { status: AgentStatus; color: string }) {
  const c = colorClasses[color];
  if (status === "idle") {
    return <span className="h-2 w-2 rounded-full bg-inkMuted/40" />;
  }
  if (status === "thinking") {
    return (
      <span
        className={`h-2 w-2 rounded-full ${c.dot} animate-pulse`}
        aria-label="sedang berpikir"
      />
    );
  }
  return <span className={`h-2 w-2 rounded-full ${c.dot}`} aria-label="selesai" />;
}

export default function AgentRoster({
  statuses,
}: {
  statuses: Record<AgentId, AgentStatus>;
}) {
  return (
    <aside className="w-full shrink-0 border-b border-line bg-surface p-5 md:w-64 md:border-b-0 md:border-r md:h-screen">
      <h2 className="font-display text-lg text-ink">Tim Agent</h2>
      <p className="mt-1 text-sm text-inkMuted">
        Setiap permintaan berjalan lewat ketiganya secara berurutan.
      </p>

      <ol className="mt-6 space-y-4">
        {AGENT_ORDER.map((id, index) => {
          const agent = AGENTS[id];
          const c = colorClasses[agent.color];
          const status = statuses[id];
          return (
            <li
              key={id}
              className={`rounded-md border-l-2 py-1 pl-3 ${
                status === "idle" ? "border-line" : c.border
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-inkMuted">{index + 1}</span>
                <StatusDot status={status} color={agent.color} />
                <span className={`font-mono text-sm ${status === "idle" ? "text-inkMuted" : c.text}`}>
                  {agent.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-inkMuted">{agent.role}</p>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
