import { NextRequest } from "next/server";
import OpenAI from "openai";
import { AGENT_ORDER, AGENTS, AgentStreamEvent, ApiKeyMap } from "@/lib/agents";

export const runtime = "nodejs";

const BASE_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

function encodeEvent(event: AgentStreamEvent): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(event) + "\n");
}

export async function POST(req: NextRequest) {
  const { message, apiKeys } = (await req.json()) as {
    message?: string;
    apiKeys?: ApiKeyMap;
  };

  if (!message || typeof message !== "string") {
    return new Response(JSON.stringify({ error: "message wajib diisi" }), {
      status: 400,
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      // Kumpulan konteks yang tumbuh setiap agent selesai,
      // supaya agent berikutnya tahu apa yang sudah dikerjakan sebelumnya.
      const context: string[] = [`Permintaan user: ${message}`];

      try {
        for (const agentId of AGENT_ORDER) {
          const agent = AGENTS[agentId];

          // Prioritas: key yang diisi user untuk agent ini di panel Settings.
          // Kalau kosong, fallback ke env var server (OPENROUTER_API_KEY).
          const apiKey = apiKeys?.[agentId] || process.env.OPENROUTER_API_KEY;

          if (!apiKey) {
            controller.enqueue(
              encodeEvent({
                type: "error",
                message: `Belum ada API key untuk agent ${agent.label}. Isi di Settings dulu.`,
              })
            );
            break;
          }

          controller.enqueue(encodeEvent({ type: "agent_start", agent: agentId }));

          // Bikin client baru per agent karena tiap agent bisa punya key beda.
          const client = new OpenAI({ baseURL: BASE_URL, apiKey });

          const completion = await client.chat.completions.create({
            model: agent.model,
            temperature: 0.4,
            messages: [
              { role: "system", content: agent.systemPrompt },
              { role: "user", content: context.join("\n\n") },
            ],
          });

          const content = completion.choices[0]?.message?.content ?? "";
          context.push(`Hasil ${agent.label}:\n${content}`);

          controller.enqueue(
            encodeEvent({ type: "agent_result", agent: agentId, content })
          );
        }
      } catch (err) {
        const messageText = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(encodeEvent({ type: "error", message: messageText }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
