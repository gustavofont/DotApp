# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Gustavo (the developer) and a small private circle of friends. This is a
personal/portfolio project, not built for public launch — no onboarding
funnel, no marketing audience. Players log in, open packs, collect cards,
and trade 1:1 with friends they already know.

## Product Purpose

DotCard is a collectible card game app: players spend an in-game currency
(DotPoints) to open packs, receive randomly-generated card exemplars from a
themed collection, build a personal collection, and trade specific cards
1:1 with friends. Success means a satisfying, well-crafted collecting/
trading loop — not engagement metrics or monetization.

## Positioning

Deliberately collection-only. Unlike Pokémon TCG, Hearthstone, or other
TCGs, DotCard has no battle/gameplay mechanic and no plan to add one
(confirmed: "sem intenção de ter jogabilidade"). The entire product is the
collecting and trading loop itself — opening packs, building a collection,
negotiating trades with friends — not a means to assemble a deck for
competitive play. A neighboring TCG could not truthfully claim the same
restraint; adding a battle mode would be a repositioning, not a feature
addition.

## Operating Context

- Player logs in via AuthForge-issued JWT (a separate, generic auth
  service shared with other projects — no game vocabulary leaks into it).
- Core loop: claim daily DotPoints reward → open a pack (1/5/10 cards)
  from a chosen collection → reveal cards one at a time → browse the
  unified Catalog (owned + unowned, unowned shown as locked silhouettes)
  → befriend other players by a rotatable friend code → propose/negotiate/
  confirm 1:1 trades.
- Two collections exist today, each with a distinct in-fiction identity:
  "Kingdom of Eldrath" (noble/kingdom/golden-dragon high fantasy) and
  "Forgotten Ruins" (undead/necrotic/crypt dark fantasy). Collections are
  seed-only — no admin CRUD in the MVP.
- Card rarity tiers: COMMON, RARE, EPIC, LEGENDARY, each with an
  established accent color and glow intensity already encoded in
  `CardArt` (`src/shared/components/CardArt.tsx`).
- Runs against a real local dev backend (DotCard-API + AuthForge + MinIO)
  during this build phase — not yet deployed publicly.

## Capabilities and Constraints

- Frontend: React 19 + TypeScript (Vite), TanStack Query for server
  state, XState v5 for multi-step flows (pack opening, trade
  negotiation), React Router v7, Tailwind v4 + shadcn/ui.
- Single dark theme only, deliberately — no light-mode variant (the
  card-art identity only exists in dark form).
- Card art and pack-cover art are served from a MinIO/S3-compatible
  bucket; the frontend never stores image assets locally.
- Currency (DotPoints) is a scarcity mechanism, not a marketplace — no
  real-money purchase exists yet (explicitly out of MVP scope on the
  backend).
- Trades are strictly 1 card for 1 card, only between confirmed friends,
  one active trade per player at a time — enforced by the backend, not
  just the UI.
- No native mobile app — responsive web only, not yet stress-tested
  against phone-sized viewports (design/dev work so far has been at
  desktop width).

## Brand Commitments

Name "DotCard" and the existing visual language (near-black ground
`#0c0c0e`, gold `#e6af2d`/`#f0c96b` accent, Iowan Old Style serif for
headings, holo-foil card frame treatment) are established in code and
treated as current authority — nothing further is locked beyond that.

## Evidence on Hand

Real uploaded card art exists for all 16 cards in "Kingdom of Eldrath"
(served from MinIO). "Forgotten Ruins" cards currently have no uploaded
art (`image_key` null) except its AI-generated pack cover. No user
testimonials, customer logos, press, or pricing exist — this is a
personal project, not a marketed product; future work must not fabricate
any of that.

## Product Principles

- Restraint over feature creep: the product is collecting and trading,
  full stop — no battle mode, no marketplace, no premium currency (yet).
- Real data, real rules: every game-affecting number (pack odds, prices,
  trade locks) is enforced server-side; the UI never fakes state the
  backend doesn't actually hold.
- One dark identity, applied consistently: no light mode, no per-page
  style drift — the holo-foil/rarity-glow language established in
  `CardArt` is the single visual system.
- Friends-only social surface: trading and friending are scoped to
  people who already know each other via a rotatable friend code, not a
  public marketplace or matchmaking system.
