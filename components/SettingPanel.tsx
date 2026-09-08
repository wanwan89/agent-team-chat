"use client";

import { useEffect, useState } from "react";
import { AGENT_ORDER, AGENTS, API_KEY_STORAGE_KEY, ApiKeyMap } from "@/lib/agents";

const colorText: Record<string, string> = {
  planner: "text-planner",
  coder: "text-coder",
  reviewer: "text-reviewer",
};

export function loadApiKeys(): ApiKeyMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(API_KEY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function SettingsPanel({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (keys: ApiKeyMap) => void;
}) {
  const [keys, setKeys] = useState<ApiKeyMap>({});
  const [sameForAll, setSameForAll] = useState(false);

  useEffect(() => {
    if (open) setKeys(loadApiKeys());
  }, [open]);

  if (!open) return null;

  function handleChange(agentId: keyof ApiKeyMap, value: string) {
    if (sameForAll) {
      const next: ApiKeyMap = {};
      AGENT_ORDER.forEach((id) => (next[id] = value));
      setKeys(next);
    } else {
      setKeys((prev) => ({ ...prev, [agentId]: value }));
    }
  }

  function handleSave() {
    window.localStorage.setItem(API_KEY_STORAGE_KEY, JSON.stringify(keys));
    onSaved(keys);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-lg border border-line bg-surface p-6">
        <h2 className="font-display text-xl text-ink">Settings</h2>
        <p className="mt-1 text-sm text-inkMuted">
          Isi API key OpenRouter kamu sendiri untuk tiap agent. Disimpan di
          browser ini saja, tidak dikirim ke mana pun selain OpenRouter.
        </p>

        <label className="mt-4 flex items-center gap-2 text-sm text-inkMuted">
          <input
            type="checkbox"
            checked={sameForAll}
            onChange={(e) => setSameForAll(e.target.checked)}
            className="accent-planner"
          />
          Pakai satu key yang sama untuk ketiga agent
        </label>

        <div className="mt-4 space-y-4">
          {AGENT_ORDER.map((id) => {
            const agent = AGENTS[id];
            return (
              <div key={id}>
                <label
                  htmlFor={`key-${id}`}
                  className={`font-mono text-xs ${colorText[agent.color]}`}
                >
                  {agent.label}
                </label>
                <input
                  id={`key-${id}`}
                  type="password"
                  autoComplete="off"
                  placeholder="sk-or-v1-..."
                  value={keys[id] ?? ""}
                  onChange={(e) => handleChange(id, e.target.value)}
                  className="mt-1 w-full rounded-md bg-surfaceRaised px-3 py-2 text-sm text-ink placeholder:text-inkMuted/60 focus:outline-none"
                />
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-inkMuted hover:text-ink"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-planner px-4 py-2 text-sm font-medium text-base"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
