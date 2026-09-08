# Agent Team Chat

Web app chat (mirip ChatGPT) buat ngobrol dengan tim AI agent — Planner,
Coder, Reviewer — yang bekerja berurutan untuk setiap permintaan. Dibangun
dengan Next.js (App Router) + TypeScript + Tailwind. Model dipanggil lewat
OpenRouter (endpoint OpenAI-compatible, jadi provider lain juga bisa).

## Struktur

```
agent-team-chat/
├── app/
│   ├── page.tsx           # Halaman chat utama
│   ├── layout.tsx         # Root layout + font
│   ├── globals.css        # Style global
│   └── api/chat/route.ts  # API route: jalankan pipeline agent, stream hasil
├── components/
│   ├── AgentRoster.tsx    # Panel status live tiap agent
│   └── MessageBubble.tsx  # Bubble chat user & agent
├── lib/
│   └── agents.ts          # Definisi agent: nama, warna, system prompt, model
└── .env.example
```

## Cara Setup

1. **Install dependency**
   ```bash
   npm install
   ```

2. **Isi environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`, isi `OPENROUTER_API_KEY` dari https://openrouter.ai/keys

3. **Jalankan development server**
   ```bash
   npm run dev
   ```
   Buka http://localhost:3000

## Cara Kerja

- Setiap pesan yang dikirim dari `app/page.tsx` di-POST ke `app/api/chat/route.ts`.
- API route ini menjalankan tiga agent secara berurutan (`lib/agents.ts` →
  `AGENT_ORDER`), masing-masing lewat OpenRouter, lalu **stream** hasil tiap
  agent balik ke browser begitu selesai (format NDJSON — satu event per baris)
  supaya user lihat progresnya real-time, bukan nunggu ketiganya kelar dulu.
- `AgentRoster` di kiri baca status ini (`idle` → `thinking` → `done`) dan
  update tampilannya secara live.

## Menyambungkan ke Backend Telegram Bot yang Sudah Dibuat

Project ini berdiri sendiri (tidak butuh Telegram). Kalau nanti mau dua-duanya
jalan bareng, ada dua opsi:
- **Pisah total**: web app ini untuk akses browser, bot Telegram untuk akses
  Telegram — dua pintu masuk beda ke agent logic yang sama.
- **Gabung**: pindahkan logic di `lib/agents.ts` + `app/api/chat/route.ts` ke
  sebuah service/API terpisah, lalu bot Telegram dan web app ini sama-sama
  panggil service itu.

## Ide Pengembangan Lanjutan

- Simpan riwayat percakapan (saat ini hilang kalau refresh halaman)
- Tambah agent baru dengan menambah entry di `AGENTS` (`lib/agents.ts`) dan
  memasukkannya ke `AGENT_ORDER`
- Tampilkan blok kode dengan syntax highlighting (misal `shiki` atau
  `react-syntax-highlighter`) di `MessageBubble`
- Tambah kemampuan agent saling lempar balik (bukan cuma satu arah linear)
