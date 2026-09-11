# DotApp

Web frontend for [DotCard-API](https://github.com/gustavofont/DotCard-API) — a collectible
card game backend. Architecture decisions, the auth flow, and every screen's UX spec are in
**[SCOPE.md](SCOPE.md)**; read that before proposing structural changes.

## Prerequisites

DotCard-API (game backend) and AuthForge (auth) running locally — see
[DotCard-API's README](https://github.com/gustavofont/DotCard-API#readme). By default this app
expects them at `http://localhost:3001` and `http://localhost:3000`.

## Setup

```bash
npm install
npm run dev      # http://localhost:5173
```

Regenerate the typed API clients whenever a backend DTO changes (both services must be running):

```bash
npm run gen:api    # DotCard-API -> src/api/dotcard.types.ts
npm run gen:auth   # AuthForge   -> src/api/authforge.types.ts
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run lint` | oxlint |
| `npm test` | Vitest (unit/component) |
| `npm run test:e2e` | Playwright (e2e) |
| `npm run gen:api` / `npm run gen:auth` | Regenerate typed API clients from each service's live Swagger |

## Docker

This repo is also a git submodule of DotCard-API, at `services/dotapp` — part of that repo's
default `docker compose up` (`npm run up`), which brings up the whole system, backend and
frontend, with one command. `docker/Dockerfile` is a multi-stage build (Node → static `dist/` →
`nginx-unprivileged`, serving on port 8080); the root compose maps that to `http://localhost:5173`.

Day-to-day frontend work still happens via `npm run dev` above, against a backend running however
you prefer (see [DotCard-API's README](https://github.com/gustavofont/DotCard-API#readme)) — the
Docker image is only the production-shaped build DotCard-API's compose brings up as `dotapp`.

If you're editing files under DotCard-API's `services/dotapp/`, remember the submodule discipline:
commit and push here first, then bump the pointer in DotCard-API's own commit.
