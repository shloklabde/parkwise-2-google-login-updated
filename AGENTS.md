# Parkwise — Base44 dev environment

## What this is
A client-side **Vite + React + TypeScript** app ("Parkwise", a smart parking
reservation platform). There is no backend process in this repo — the app talks
directly to **Firebase** (Auth + Firestore) from the browser using a hardcoded
config in `src/lib/firebase.ts` (project `parkwise-c2b26`).

## Running it
- `docker compose -f docker-compose.base44.yml up -d` brings up the web service.
- Container image: `oven/bun:1` (the repo ships a `bun.lock`, so bun is the
  package manager). The command runs `bun install --frozen-lockfile && bun run dev`.
- Source is bind-mounted at `/app`; `node_modules` lives in a named volume so
  installs persist across restarts. Edits hot-reload via Vite HMR.
- Web entry point is on host port **3000**.

## Vite / preview host
- `vite.config.ts` sets `server.host: '0.0.0.0'` and `allowedHosts: true` so the
  preview's external hostname is accepted. Do not remove `allowedHosts: true`.

## Secrets
- **No secrets are required to boot.** Firebase config is hardcoded in source.
- `VITE_OLA_MAPS_API_KEY` (optional): enables Ola Maps vector tiles + directions.
  Without it the map falls back to a base street map and a simulated route.
  Delivered via `/run/base44/app.env`; placeholders live in `.env.base44-defaults`.
- `GEMINI_API_KEY` / `FIREBASE_API_KEY` appear in `.env.example` and `package.json`
  deps but are **not referenced anywhere in `src/`** — ignore them.

## Verifying it works
- `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/`
  must return the HTML document (Vite dev server, not a prebuilt bundle).
- The app renders a landing/marketing view while signed out; auth + booking
  flows require the Firebase project's Auth/Authorized domains to include the
  preview origin (Google popup sign-in needs the domain allowlisted in Firebase).

## Notes
- A harmless Vite warning about `maplibre-gl-worker.mjs` in the optimize-deps
  directory appears on first boot; it does not break the app.
