---
name: DotCard
description: A collectible-only fantasy card game — every owned card is treated as a sealed, certified slab, not gift-wrapped foil packaging.
colors:
  molten-gold: "#e6af2d"
  legendary-shine: "#f0c96b"
  void-black: "#0c0c0e"
  void-black-deep: "#090909"
  charcoal-surface: "#17171a"
  slate-surface: "#202024"
  hairline: "#333338"
  parchment-white: "#e8e6e0"
  parchment-dim: "#9a9a9e"
  parchment-faint: "#87878d"
  common-steel: "#aaaaaf"
  rare-sapphire: "#468ce6"
  epic-amethyst: "#a846e6"
  destructive-ember: "#d54c43"
typography:
  display:
    fontFamily: "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, 'Liberation Serif', serif"
    fontWeight: 600
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontWeight: 400
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.05em"
  cert:
    fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Menlo, Consolas, 'Liberation Mono', monospace"
    fontSize: "7px-8px"
    letterSpacing: "0.05em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
  slab-inner: "7px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.molten-gold}"
    textColor: "#241a06"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "color-mix(in oklch, {colors.molten-gold} 80%, transparent)"
  button-outline:
    backgroundColor: "{colors.void-black}"
    textColor: "{colors.parchment-white}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  input-field:
    backgroundColor: "{colors.slate-surface}"
    textColor: "{colors.parchment-white}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  card-surface:
    backgroundColor: "{colors.charcoal-surface}"
    textColor: "{colors.parchment-white}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  card-slab:
    backgroundColor: "{colors.slate-surface}"
    textColor: "{colors.parchment-white}"
    rounded: "{rounded.lg}"
  toast:
    backgroundColor: "{colors.charcoal-surface}"
    textColor: "{colors.parchment-white}"
    rounded: "{rounded.lg}"
  toast-error:
    backgroundColor: "{colors.charcoal-surface}"
    textColor: "{colors.destructive-ember}"
    rounded: "{rounded.lg}"
---

# Design System: DotCard

## Overview

**Creative North Star: "The Grading Slab"**

Owning a card is it being sealed and certified — the act of possession is
the precious object, not just the art underneath. Every `CardArt` is a
PSA/BGS-style graded slab: a glassy, colorless acrylic case (not a
rarity-colored border), topped by a dense label strip carrying a thin
holographic rarity band, a mono certificate serial number (the real
database id of that exact exemplar), the card's name, and a numeric grade
derived from its `float_value` — the same "lower float = better condition"
convention the app already used to pick a card's "best" copy, now made
visible as a number instead of staying implicit. A locked (unowned) card
is an empty, label-less case: a dashed outline and a lock icon, deliberately
inert. This replaced an earlier "holo-foil booster pack" treatment
(full-border rarity gradient, a circular medallion, a clip-path name
banner) — same void-black/molten-gold palette throughout, a confirmed
brand commitment that this redesign did not touch; only the material
language wrapping the palette changed, from *gift-wrapped* to *certified*.

**Key Characteristics:**
- Near-black ground with a single reserved gold accent, not a dark theme with several competing accents.
- Rarity now lives in a concentrated holo strip and the label's GR text color, not a full-card border — the case itself stays neutral/glassy.
- Every owned exemplar carries a visible mono serial number and numeric grade — no two copies of the same card are visually interchangeable.
- Serif display type for headings and card names; sans for UI chrome; mono for certificate data (serials, grades, rarity/type tags).
- No light mode. The identity only exists in dark form.

## Colors

The palette is almost monochrome by design — void-black and parchment-white carry the whole UI — with color entering only through the four-tier rarity system and the single gold accent.

### Primary
- **Molten Gold** (`#e6af2d`): the one reserved accent. Primary buttons, active nav state, focus rings, and LEGENDARY rarity's holo strip/glow/GR text. Used on a small fraction of any screen — its rarity in the UI mirrors the rarity it represents.
- **Legendary Shine** (`#f0c96b`): the lighter stop in LEGENDARY's holo-strip gradient and its glow.

### Secondary — the rarity ladder
- **Common Steel** (`#aaaaaf`): COMMON rarity. No glow (0px) — the baseline everything else escalates from.
- **Rare Sapphire** (`#468ce6`): RARE rarity. Modest glow (9px).
- **Epic Amethyst** (`#a846e6`): EPIC rarity. Stronger glow (16px).
- *(LEGENDARY reuses Molten Gold/Legendary Shine above, at the strongest glow — 24px — rather than introducing a fifth color.)*

Every rarity-colored element — the holo strip, the glow, a card's own GR text, the exemplar-list's GR text, the duplicate-count `×N` badge — reads its color from the same `RARITY_ACCENT` map (`src/shared/rarity.ts`), the single source of truth. Gold appearing on a COMMON/RARE/EPIC element anywhere is a bug, not a variant.

### Neutral
- **Void Black** (`#0c0c0e`): page background (`body`, `--color-ground`).
- **Void Black Deep** (`#090909`): the darkest ground variant, used sparingly beneath the primary ground.
- **Charcoal Surface** (`#17171a`): raised panels — login form, Home's balance card, dialogs.
- **Slate Surface** (`#202024`): a slab's own case interior and label background, plus input fields and secondary surfaces generally.
- **Hairline** (`#333338`): all borders and dividers, including a locked slab's dashed outline.
- **Parchment White** (`#e8e6e0`): primary text — a warm off-white, not a clinical pure white, matching the fantasy-parchment tone of the display serif.
- **Parchment Dim** (`#9a9a9e`): secondary text, labels, de-emphasized values.
- **Parchment Faint** (`#87878d`): tertiary text (a slab's serial number, placeholders) — clears WCAG AA (≥4.5:1) against ground, surface, and surface-2 alike.
- **Destructive Ember** (`#d54c43`): errors and destructive actions only.

### Named Rules
**The Reserved Gold Rule.** Molten Gold appears on the primary action and on LEGENDARY rarity — nowhere else. A second unrelated gold element on the same screen dilutes both.

**The Earned Glow Rule.** Box-shadow glow exists only as a function of rarity (0 / 9 / 16 / 24px for COMMON/RARE/EPIC/LEGENDARY). No UI element outside the rarity system gets a decorative glow.

## Typography

**Display Font:** Iowan Old Style (with Palatino Linotype, Palatino, Book Antiqua, Georgia, Liberation Serif, serif fallbacks)
**Body Font:** -apple-system / Segoe UI / Roboto / Helvetica Neue / Arial, sans-serif
**Cert Font:** ui-monospace / SF Mono / Cascadia Code / Roboto Mono / Menlo / Consolas, monospace — new in this redesign

**Character:** The serif carries every moment that should feel like a physical collectible — page titles, a slab's card name. The sans face handles UI chrome — buttons, section labels, form fields, body copy. The mono face is new: it's the certificate/ledger register — serial numbers, numeric grades, and the rarity·type tag on every slab's label read like a technical cert, not a game UI, deliberately colder than the serif beside it.

### Hierarchy
- **Display** (600, `text-xl`/`text-2xl`, serif): Page titles ("Abrir Pacote", "Catálogo"), the DotCard wordmark.
- **Title** (600, `text-lg`, serif): Modal titles.
- **Slab name** (600, 11px, serif): A CardArt label's own card name — smaller than Title, sized for grid density.
- **Body** (400, `text-sm`, sans): Default UI copy, list rows, form values.
- **Label** (600, `text-xs`, sans, uppercase, `0.05em` tracking): Section headers ("COLEÇÃO", "TAMANHO DO PACOTE"), field labels — always uppercase, always the faint/dim ink color, never full-strength parchment-white.
- **Cert** (400-700, 7-8px, mono, uppercase where it's a tag): A slab's serial (`NO. 000042`), grade (`GR 8.3`, bold, rarity-colored), and rarity·type tag. Small on purpose — real grading-slab labels are dense — but every use clears AA contrast at that size.

### Named Rules
**The Serif-Means-Precious Rule.** If the serif appears somewhere, that content is meant to feel collectible-grade. Don't reach for it on routine UI chrome (button labels, form inputs) — that dilutes the signal.

**The Cert-Is-Cold Rule.** Mono type never carries warmth or personality — it's the register for facts (a serial, a grade), never for anything the serif or sans could say instead.

## Layout

Single-column, centered layouts throughout — `max-w-md` (28rem) for focused single-task screens (Home, Login, Abrir Pacote, Amigos, Trocas), `max-w-4xl` (56rem) for the Nav shell and the Catálogo grid. No sidebar, no multi-column dashboard chrome. The Nav wraps onto a second line rather than clipping items on narrow viewports (`flex-wrap`, not `overflow-x-auto` with no scroll affordance) — every screen genuinely works down to 390px now, not just in theory.

Spacing rhythm follows Tailwind's default scale directly: `gap-2` (8px) between tightly related controls (a row of pack-size buttons), `gap-4` (16px) between form fields, `gap-6` (24px) between distinct sections of a screen. Grids (Catálogo) use `gap-3` (12px) between tiles.

## Elevation & Depth

Flat by default — the base UI does not use drop shadows for hierarchy. The one shadow vocabulary that exists is rarity glow, and it is **ambient, not structural**: it signals "this is valuable," not "this is elevated above the surface" or "this is interactive." A COMMON slab sits perfectly flush with no glow at all; a LEGENDARY slab glows regardless of hover/focus state.

### Shadow Vocabulary
- **Rarity glow** (`box-shadow: 0 0 {0|9|16|24}px 0 color-mix(in srgb, {rarity-color} 45%, transparent)`): scales with COMMON→LEGENDARY, applied to the slab's outer case. The only shadow in the system.
- **Pack glow** (`box-shadow: 0 0 44-60px -4-6px color-mix(in srgb, var(--color-legendary) 45-60%, transparent)`): the pack-opening screen's version of the same idea, applied to the sealed booster pack itself — a different object from a graded card, so it keeps its own gift/pack material language rather than becoming a slab.

### Named Rules
**The Flat-Unless-Rare Rule.** Nothing gets a shadow by default. A shadow is always the rarity system speaking, never a generic "card" or "panel" affordance.

## Shapes

Rounded-but-not-soft, and slightly tighter than the identity's first version: `rounded-lg` (10px) for buttons, inputs, select fields, and a slab's outer case; a nested `rounded-[7px]` for the case's inner content well, one step tighter than the case so the acrylic edge reads as a consistent ring rather than concentric mismatched curves. `rounded-2xl` (18px) is reserved for larger flat panels — dialogs, the login form, Home's balance card — that aren't slabs. Borders are hairline (`#333338`, 1px) everywhere they appear, solid on an owned slab's case and **dashed** specifically on a locked/empty case, the one place border style itself carries meaning.

## Components

Every slab carries a trace of the object it represents — a real serial, a real grade, rarity-as-holo-strip — rather than reading as generic flat SaaS UI. Plain UI chrome (buttons, inputs, nav) stays deliberately quieter than a slab: the drama budget is spent on certifying a card, not on decorating a button.

### Buttons
- **Shape:** `rounded-lg` (10px), border-transparent by default.
- **Primary:** Molten Gold background, near-black text (`#241a06`) — the highest-contrast pairing in the system, reserved for the one primary action per screen.
- **Hover / Focus:** primary dims to 80% opacity on hover; focus shows a 3px gold ring (`--ring`) — the same gold as the primary action, so focus always reads as "the gold system," never a generic blue.
- **Outline / Ghost / Destructive:** outline uses void-black fill with a hairline border; ghost is transparent until hover; destructive uses Destructive Ember at 10% background / full-strength text, reserved for irreversible actions (declining an invite, cancelling a trade).
- **Signature interactive surface — the pack button:** the "Abrir pacote" action is not a `<button>Abrir pacote</button>` — it *is* the sealed-pack art itself, scaling up 3% on hover and down 3% on press, with a permanent gold glow. A pack is not yet a slab — it's what a slab comes from — so it keeps its own gift-wrap material language (foil sheen, pulsing glow) rather than the case/label language below.

### Cards / Containers
- **Corner Style:** `rounded-2xl` (18px) for flat panels (login form, Home's balance card, dialogs) — these are not slabs and don't take the case treatment.
- **Background:** Charcoal Surface (`#17171a`) for panels; Slate Surface (`#202024`) for a slab's own case interior/label and for input fields — a two-step depth cue without ever using a shadow.
- **Shadow Strategy:** none by default (see Elevation & Depth) — a slab's only shadow is its rarity glow.
- **Border:** 1px hairline (`#333338`) on every panel; solid on an owned slab, dashed on a locked/empty one.
- **Internal Padding:** `p-5` (20px) on flat panels; a slab's case padding is `3px` (the acrylic-edge ring itself), with `6px`/`4px` (`px-1.5 py-1`) inside the label strip.

### Inputs / Fields
- **Style:** Slate Surface background, hairline border, `rounded-lg`, `px-3 py-2`.
- **Focus:** border shifts to Molten Gold (`focus-visible:border-legendary`) — no glow, no ring on plain text inputs; the gold border alone is enough.
- **Labels:** always the Label typography role — uppercase, tracked-out, Parchment Dim — sitting directly above the field, associated via `htmlFor`/`id` (every select/input in the app is now properly labeled for assistive tech), never inline or floating.

### Navigation
- A left sidebar (`sm:` and up) that collapses to a horizontal top bar below it — one set of DOM nodes, no duplicate markup and no JS drawer state, just `sm:flex-col` vs. the mobile row; the same single-node discipline the earlier flex-wrap overflow fix used, so it stays testable in jsdom and never regresses mobile (an early fixed-width sidebar draft was shown to break badly at 390px before this). The "DotCard" wordmark is itself a link home.
- `sm:sticky sm:top-0` alongside `sm:h-svh` — the sidebar is exactly one viewport tall *and* pinned there, so it tracks scroll instead of running out partway down a page taller than one screen (the Catálogo grid, for instance) and leaving bare ground below it.
- Trimmed to actual browsing destinations — Home, Catálogo, Amigos. "Abrir Pacote" and "Trocas" are actions launched from Home now, not standing links; a nav bar lists places, not verbs.
- Link labels take the Label typographic role — uppercase, tracked-out — instead of plain sans case, giving the bar structure without decoration.
- Links are Parchment Dim by default, Molten Gold when active (`aria-current="page"`, managed by the router), on a `bg-legendary/10` pill — not a directional accent border (a side-tab border on a rounded element is the single most recognizable AI-slop tell; a filled pill reads as chosen instead of templated) and not glow either, still the one place an active/selected state is communicated by a static color rather than the rarity-glow language, because a nav bar is wayfinding, not a collectible (The Earned Glow Rule holds: no shadow here, ever).
- Every link and the "Sair" action (the shared `Button`, `ghost` variant, not raw text) carry a proper `focus-visible` gold ring matching the Button component's own treatment — keyboard navigation is never left to the browser default outline.
- The language switcher sits below the links, next to "Sair" — a settings-adjacent action, not a browsing destination, so it's grouped with account controls rather than in the `LINKS` list.

### Language switcher
`shared/components/LanguageSwitcher.tsx` — two buttons (🇧🇷 PT / 🇺🇸 EN), same selected-state treatment as the nav's own active link (`bg-legendary/10 text-legendary`, `text-ink-dim` otherwise) — wayfinding-style static color, not rarity glow, same exception the nav links already carve out. The flag emoji needs no icon library or asset. Choice is explicit and interface-driven only: no `navigator.language` guessing, persisted to `localStorage` so it survives a reload. All app copy lives in `src/i18n/locales/{pt,en}.json` via `react-i18next`; pt is the fallback/default language.

### Toasts
`components/ui/sonner.tsx` wraps `sonner`, themed from the same tokens as everything else (`--normal-bg`/`--normal-text`/`--normal-border` mapped to `--popover`/`--popover-foreground`/`--border`; `--error-*` mapped to Destructive Ember). Dark-only, hardcoded (`theme="dark"`) rather than read from a theme provider the app doesn't have. Scope is deliberately narrow — see the Do's and Don'ts: system/network status the app needs to confess (a login throttled, a request that couldn't reach the server), never a game event.

### CardArt — "the slab" (signature component)
The case is a glassy, **colorless** acrylic edge (`linear-gradient(135deg, rgba(255,255,255,.24), rgba(255,255,255,.02) 45%, rgba(255,255,255,.14) 75%, rgba(255,255,255,.24))`) — a 3px padding trick, not a border-image — topped by a label strip (hidden in `compact` mode for small thumbnails):
1. A 4px **holo rarity strip**, a rarity-colored gradient with a diagonal light-sheen overlay — this is where rarity color is concentrated now, not the whole case border.
2. A serial/grade row (mono, only when the exemplar's `wear` data is present — i.e. it's owned): `NO. 000042` left, `GR 8.3` right, GR always colored by that card's own rarity accent (never a flat gold, matching The Reserved Gold Rule).
3. The card name (serif, 11px, semibold) — always rendered when the label is shown, so every owned slab in a grid has identical label height regardless of whether its art loaded.
4. A rarity·type tag (mono, 7px, uppercase, truncated so "LEGENDARY · CREATURE" never wraps onto a second line at grid/mobile widths).

Below the label, the art well carries the same wear system as before: an SVG-noise grain layer, three procedurally-scratched layers (hairline/scuff/gouge, gradient ids namespaced per-exemplar so adjacent cards in a grid never collide), four corner smudges, and an inset vignette, all scaled by the exemplar's real `float_value` — the same data that now also drives the visible GR number, so the numeric grade and the visible wear always agree. Locked (unowned) cards render as an empty case: a dashed hairline outline, a blank label-height strip with no content, and a centered lock icon at 40% opacity — deliberately inert, no gradient, no glow, so an unowned card never competes visually with a certified one.

### Catálogo — uma coleção por vez
Cartas carregam por coleção, não a coleção inteira do jogo de uma vez — a
primeira coleção aparece ao abrir a tela, a próxima só quando o scroll
chega ao fim da atual (sentinel + `IntersectionObserver`). Dentro de cada
coleção já carregada, cartas possuídas ficam num grid; as trancadas saem
dali e formam uma seção própria abaixo, com o rótulo "Cartas faltando" —
nunca misturadas na mesma grade. `content-visibility: auto` nos dois
grids evita layout/paint de qualquer trecho fora da viewport, sem precisar
de virtualização (coleções são curadas e pequenas por natureza).

## Do's and Don'ts

### Do:
- **Do** reserve Molten Gold for the primary action and LEGENDARY rarity — never a decorative accent elsewhere on the same screen, including a GR value or a count badge on a non-legendary card.
- **Do** let rarity be the only source of glow/shadow in the system (0/9/16/24px COMMON→LEGENDARY).
- **Do** use the serif display face only for content that should feel collectible-grade (titles, a slab's card name) — not for buttons or form labels.
- **Do** keep a slab's label height constant regardless of art/data availability — render the name unconditionally, gate only what genuinely has nothing to show (serial/grade with no `wear`).
- **Do** namespace any per-exemplar generated SVG id by that exemplar's own identity, not just a locally-shifted seed, whenever more than one card can render on the same page.

### Don't:
- **Don't** add drop shadows for generic UI hierarchy (dropdown menus, sticky headers) — depth comes from the surface/ground contrast (Charcoal vs. Slate vs. Void), not shadows.
- **Don't** introduce a second accent color alongside gold. Secondary/tertiary color only exists as the rarity ladder.
- **Don't** reach for celebratory mobile-freemium patterns — confetti, badge/streak counters, a toast for genuinely good news (a LEGENDARY pull, a completed trade). The existing pack-shake + glow language is the ceiling for celebration. Toasts do have one legitimate job here: system/network status the user didn't cause and can't see any other way (a login throttled, a request that failed to reach the server) — that's information, not celebration, and `components/ui/sonner.tsx` (dark-only, themed off the same tokens) is where it lives. Never toast a game event; only toast what the app itself needs to confess.
- **Don't** ship a light theme or a `prefers-color-scheme` variant. The identity is dark-only; `dark:` variants stay permanently inert behind a `.dark` class the app never applies.
- **Don't** let a slab's own label and a nearby list (the exemplar-list modal, a duplicate-count badge) disagree on how the same rarity is colored — one `RARITY_ACCENT` map (`src/shared/rarity.ts`), never a locally hardcoded gold.
