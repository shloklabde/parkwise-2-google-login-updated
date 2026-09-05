# Parkwise — Base44 dev environment

## What this is
A frontend-only Vite + React + TypeScript app ("Parkwise", a smart parking
reservation UI). There is no backend server, no local database, and no worker.

## Stack
- Package manager: **bun** (`bun.lock` present). `bun install && bun run dev`.
- Vite dev server on port 3000, host 0.0.0.0.
- Firebase (web SDK) — config is hardcoded in `src/lib/firebase.ts`; these are
  public web API keys, not secrets. Auth + Firestore are used by
  `src/services/firebaseServices.ts`, but the main app routes use the mock
  services in `src/services/mockServices.ts`.
- `@google/genai` is a dependency but `GEMINI_API_KEY` is NOT referenced anywhere
  in `src/`. No secret is required to boot.

## Running
```
docker compose -f docker-compose.base44.yml up -d --build
```
The compose service bind-mounts the repo and runs `bun install && bun run dev`,
so source edits hot-reload.

## Verify
- `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/`
  returns the app HTML.
- Preview iframe loads the Parkwise landing page.

## Notes
- `vite.config.ts` sets `server.allowedHosts: true` so the preview's external
  hostname is accepted.
