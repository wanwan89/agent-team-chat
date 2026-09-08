// Definisi tim agent yang dipakai di UI (roster, warna, label)
// dan di API route (system prompt, model).

export type AgentId = "planner" | "coder" | "reviewer";

export interface AgentDefinition {
  id: AgentId;
  label: string;
  role: string;
  color: string; // Tailwind color token, cocokkan dengan tailwind.config.ts
  systemPrompt: string;
  model: string;
}

export const AGENT_ORDER: AgentId[] = ["planner", "coder", "reviewer"];

export const AGENTS: Record<AgentId, AgentDefinition> = {
  planner: {
    id: "planner",
    label: "Planner",
    role: "Memecah permintaan jadi rencana langkah-langkah",
    color: "planner",
    systemPrompt:
      "Kamu adalah PLANNER dalam tim AI agent. Tugasmu memecah permintaan " +
      "user jadi langkah-langkah kecil yang jelas dan actionable. " +
      "Jangan menulis kode. Cukup buat rencana singkat (poin-poin).",
    model: "openai/gpt-4o-mini",
  },
  coder: {
    id: "coder",
    label: "Coder",
    role: "Mengeksekusi rencana jadi solusi konkret",
    color: "coder",
    systemPrompt:
      "Kamu adalah CODER dalam tim AI agent. Kamu menerima rencana dari " +
      "PLANNER dan mengubahnya jadi kode/solusi konkret. Jawab dengan kode " +
      "yang rapi dan penjelasan singkat.",
    model: "anthropic/claude-3.5-sonnet",
  },
  reviewer: {
    id: "reviewer",
    label: "Reviewer",
    role: "Mengecek hasil sebelum dikirim ke user",
    color: "reviewer",
    systemPrompt:
      "Kamu adalah REVIEWER dalam tim AI agent. Tugasmu mengecek hasil dari " +
      "CODER: apakah sudah benar, aman, dan sesuai rencana PLANNER. Beri " +
      "catatan singkat: OK atau perbaikan yang diperlukan.",
    model: "openai/gpt-4o-mini",
  },
};

// API key OpenRouter per agent, diisi user sendiri lewat panel Settings
// dan disimpan di localStorage browser (bukan di server).
export type ApiKeyMap = Partial<Record<AgentId, string>>;

export const API_KEY_STORAGE_KEY = "agent-team-chat:api-keys";

// Bentuk satu event yang dikirim lewat streaming dari API route ke UI
export type AgentStreamEvent =
  | { type: "agent_start"; agent: AgentId }
  | { type: "agent_result"; agent: AgentId; content: string }
  | { type: "error"; message: string };
