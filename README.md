# QuickAI

Full-stack AI SaaS platform

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas) for auth persistence
- [Google AI Studio](https://aistudio.google.com/) API key for Gemini features

## Setup

```bash
cd ai-saas-project
npm run install:all
```

Copy environment files:

- `server/.env.example` → `server/.env` and set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`. **`GEMINI_API_KEY`** is optional in local dev (article/resume use demo text if unset); required in production for real AI ([get a key](https://aistudio.google.com/apikey)). The server uses model **`gemini-2.5-flash`** by default; override with **`GEMINI_MODEL`** if Google renames endpoints ([model list](https://ai.google.dev/gemini-api/docs/models/gemini)).
- Optional: `REMOVEBG_API_KEY` for the background remover ([remove.bg API](https://www.remove.bg/api)).
- `client/.env.example` → `client/.env` (optional; defaults work with Vite proxy).

## Run (client + server)

From the **repo root**:

```bash
npm run dev
```

Or from **`client/`** (starts Vite **and** the API):

```bash
npm run dev
```

Use `npm run dev:client` in `client/` if you only want Vite and will start the API yourself.

- Client: http://localhost:5173 (Vite may pick 5174 if 5173 is busy)  
- API: **http://localhost:5001** by default (`PORT` in `server/.env`)

Port **5000** is often already used on Windows (another Node app or system service). This project defaults the API to **5001** so Vite’s proxy hits QuickAI, not a random process on 5000.

If login/register shows **404**, ensure `server/.env` exists with `MONGODB_URI` and `JWT_SECRET`, and that the **api** process in the terminal started successfully. If you change `PORT` in `server/.env`, set the same origin in `client/.env` as `VITE_DEV_API_ORIGIN=http://127.0.0.1:YOUR_PORT`.

## API overview

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/auth/register` | `{ email, password, name? }` |
| POST | `/api/auth/login` | `{ email, password }` |
| GET | `/api/auth/me` | Bearer token |
| POST | `/api/ai/article` | `{ topic, tone? }` |
| POST | `/api/ai/resume` | `{ text }` |
| POST | `/api/ai/summary` | `{ text, format?: "bullet" \| "paragraph" }` |
| POST | `/api/ai/titles` | `{ topic, count?: number }` |
| POST | `/api/ai/email` | `{ about, tone?: "formal" \| "informal", recipientContext? }` |
| POST | `/api/ai/image` | `{ prompt, style? }` |
| POST | `/api/ai/bg-remove` | `multipart/form-data` field `image` |
| POST | `/api/ai/remove-object` | `multipart`: `image`, `objectDescription` |

## Production build

```bash
npm run build
```

Serve `client/dist` behind your host of choice; point `VITE_API_URL` to your API base URL.
