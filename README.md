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

Not part of DotCard-API's default `docker compose up` — this app is still under active local
development via `npm run dev`. To preview the production build in the same network as the
backend (assumes both repos are cloned as sibling directories):

```bash
cd ../DotCard-API
docker compose --profile dotapp up --build dotapp   # http://localhost:5173
```
