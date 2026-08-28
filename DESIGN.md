---
name: DotCard
description: A collectible-only fantasy card game — the UI is treated as booster-pack packaging, not a mobile-game shell.
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
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
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
---

# Design System: DotCard

## Overview

**Creative North Star: "The Sealed Pack"**

Every screen behaves like a booster pack, not a mobile-game dashboard. The
ground is void-black; nothing shines unless it's earned. Gold is reserved
for the primary action and for LEGENDARY rarity — it never decorates
idle chrome. Where a typical collectible-game UI reaches for confetti,
badges, and celebratory pop-ups, DotCard stays sober and premium: the only
"gamified" flourish in the whole app is the pack-opening shake, and even
that borrows its glow language from the same rarity system every card
already uses. This is deliberate anti-reference — DotCard rejects
mobile-freemium visual habits (bright celebratory bursts, layered drop
shadows, saturated gradients everywhere) in favor of restraint that makes
the rare moments — a LEGENDARY pull, a foil card in the catalog — actually
read as rare.

**Key Characteristics:**
- Near-black ground with a single reserved gold accent, not a dark theme with several competing accents.
- Rarity is the only thing allowed to escalate glow/drama — COMMON is flat, LEGENDARY glows.
- Serif display type for headings and card names; sans for everything functional.
- No light mode. The identity only exists in dark form.

## Colors

The palette is almost monochrome by design — void-black and parchment-white carry the whole UI — with color entering only through the four-tier rarity system and the single gold accent.

### Primary
- **Molten Gold** (`#e6af2d`): the one reserved accent. Primary buttons, active nav state, focus rings, and LEGENDARY rarity. Used on a small fraction of any screen — its rarity in the UI mirrors the rarity it represents.
- **Legendary Shine** (`#f0c96b`): the lighter end of the gold gradient — the top-left highlight of the holo-foil card border, and the bright stop in LEGENDARY's glow.

### Secondary — the rarity ladder
- **Common Steel** (`#aaaaaf`): COMMON rarity. No glow (0px) — the baseline everything else escalates from.
- **Rare Sapphire** (`#468ce6`): RARE rarity. Modest glow (9px).
- **Epic Amethyst** (`#a846e6`): EPIC rarity. Stronger glow (16px).
- *(LEGENDARY reuses Molten Gold/Legendary Shine above, at the strongest glow — 24px — rather than introducing a fifth color.)*

### Neutral
- **Void Black** (`#0c0c0e`): page background (`body`, `--color-ground`).
- **Void Black Deep** (`#090909`): the darkest ground variant, used sparingly beneath the primary ground.
- **Charcoal Surface** (`#17171a`): raised surfaces — cards, panels, the login form.
- **Slate Surface** (`#202024`): secondary surfaces — input fields, filter chips, badges.
- **Hairline** (`#333338`): all borders and dividers.
- **Parchment White** (`#e8e6e0`): primary text — a warm off-white, not a clinical pure white, matching the fantasy-parchment tone of the display serif.
- **Parchment Dim** (`#9a9a9e`): secondary text, labels, de-emphasized values.
- **Parchment Faint** (`#87878d`): tertiary text, placeholders, the least important label on a screen.
- **Destructive Ember** (`#d54c43`): errors and destructive actions only.

### Named Rules
**The Reserved Gold Rule.** Molten Gold appears on the primary action and on LEGENDARY rarity — nowhere else. A second unrelated gold element on the same screen dilutes both.

**The Earned Glow Rule.** Box-shadow glow exists only as a function of rarity (0 / 9 / 16 / 24px for COMMON/RARE/EPIC/LEGENDARY). No UI element outside the rarity system gets a decorative glow.

## Typography

**Display Font:** Iowan Old Style (with Palatino Linotype, Palatino, Book Antiqua, Georgia, Liberation Serif, serif fallbacks)
**Body Font:** -apple-system / Segoe UI / Roboto / Helvetica Neue / Arial, sans-serif

**Character:** The serif carries every moment that should feel like a physical collectible — page titles, card names, the DotCard wordmark on the pack. The sans face handles everything functional — buttons, labels, form fields, body copy — so the serif's rarity stays intact.

### Hierarchy
- **Display** (600, `text-xl`/`text-2xl`, serif): Page titles ("Abrir Pacote", "Catálogo"), the DotCard wordmark.
- **Title** (600, `text-lg`, serif): Card names on CardArt's name banner, modal titles.
- **Body** (400, `text-sm`, sans): Default UI copy, list rows, form values.
- **Label** (600, `text-xs`, sans, uppercase, `0.05em` tracking): Section headers ("COLEÇÃO", "TAMANHO DO PACOTE"), field labels — always uppercase, always the faint/dim ink color, never full-strength parchment-white.

### Named Rules
**The Serif-Means-Precious Rule.** If the serif appears somewhere, that content is meant to feel collectible-grade. Don't reach for it on routine UI chrome (button labels, form inputs) — that dilutes the signal.

## Layout

Single-column, centered layouts throughout — `max-w-md` (28rem) for focused single-task screens (Home, Login, Abrir Pacote, Amigos, Trocas), `max-w-4xl` (56rem) for the Nav shell and the Catálogo grid. No sidebar, no multi-column dashboard chrome — every screen is a narrow, mobile-friendly column even though phone-width has not yet been stress-tested.

Spacing rhythm follows Tailwind's default scale directly: `gap-2` (8px) between tightly related controls (a row of pack-size buttons), `gap-4` (16px) between form fields, `gap-6` (24px) between distinct sections of a screen. Grids (Catálogo) use `gap-3` (12px) between tiles.

## Elevation & Depth

Flat by default — the base UI does not use drop shadows for hierarchy. The one shadow vocabulary that exists is rarity glow, and it is **ambient, not structural**: it signals "this is valuable," not "this is elevated above the surface" or "this is interactive." A COMMON card sits perfectly flush with no shadow at all; a LEGENDARY card glows regardless of hover/focus state.

### Shadow Vocabulary
- **Rarity glow** (`box-shadow: 0 0 {0|9|16|24}px 0 color-mix(in srgb, {rarity-color} 45%, transparent)`): scales with COMMON→LEGENDARY. The only shadow in the system.
- **Pack glow** (`box-shadow: 0 0 44-60px -4-6px color-mix(in srgb, var(--color-legendary) 45-60%, transparent)`): the pack-opening screen's version of the same idea, applied to the booster pack itself rather than a card.

### Named Rules
**The Flat-Unless-Rare Rule.** Nothing gets a shadow by default. A shadow is always the rarity system speaking, never a generic "card" or "panel" affordance.

## Shapes

Rounded-but-not-soft: `rounded-lg` (10px) for buttons, inputs, and select fields; `rounded-2xl` (18px) for CardArt's outer holo-foil frame and larger surfaces (dialogs, panels); a nested `rounded-[13px]` for CardArt's inner image, one step tighter than its own outer frame so the foil border reads as a consistent ring rather than concentric mismatched curves. Borders are hairline (`#333338`, 1px) everywhere they appear — never a heavier structural border.

## Components

Every interactive surface is meant to carry a trace of the same material the cards are printed on — foil, sheen, rarity-glow — rather than reading as generic flat SaaS UI. Today `CardArt` fully embodies this (holo-foil gradient border, rarity glow, wear texture); the booster-pack cover pushes it further (foil sheen texture, pulsing glow on open); plain UI chrome (buttons, inputs, nav) currently under-expresses it and is the surface most worth extending — a button's hover state, a focus ring, or an active nav link is where a foil-edge or rarity-glow echo belongs next, not a generic color-darken.

### Buttons
- **Shape:** `rounded-lg` (10px), border-transparent by default.
- **Primary:** Molten Gold background, near-black text (`#241a06`) — the highest-contrast pairing in the system, reserved for the one primary action per screen.
- **Hover / Focus:** primary dims to 80% opacity on hover; focus shows a 3px gold ring (`--ring`) — the same gold as the primary action, so focus always reads as "the gold system," never a generic blue.
- **Outline / Ghost / Destructive:** outline uses void-black fill with a hairline border; ghost is transparent until hover; destructive uses Destructive Ember at 10% background / full-strength text, reserved for irreversible actions (declining an invite, cancelling a trade).
- **Signature interactive surface — the pack button:** the "Abrir pacote" action is not a `<button>Abrir pacote</button>` — it *is* the pack art itself, scaling up 3% on hover and down 3% on press, with a permanent rarity-style gold glow. This is the clearest expression of "the UI is packaging" in the whole app and should be the reference for any future primary action tied to a physical collectible metaphor.

### Cards / Containers
- **Corner Style:** `rounded-2xl` (18px) for panels (login form, Home's balance card, dialogs); CardArt itself uses the same 18px outer / 13px inner pairing described in Shapes.
- **Background:** Charcoal Surface (`#17171a`), occasionally Slate Surface (`#202024`) for a secondary/nested surface (input fields sit on Slate Surface even inside a Charcoal Surface panel, keeping a two-step depth cue without ever using a shadow).
- **Shadow Strategy:** none by default (see Elevation & Depth) — a container's only shadow is the rarity glow, when it's a card.
- **Border:** 1px hairline (`#333338`) on every panel and card.
- **Internal Padding:** `p-5` (20px) on panels; CardArt's frame padding is `3px` (the holo-foil ring itself).

### Inputs / Fields
- **Style:** Slate Surface background, hairline border, `rounded-lg`, `px-3 py-2`.
- **Focus:** border shifts to Molten Gold (`focus-visible:border-legendary`) — no glow, no ring on plain text inputs; the gold border alone is enough.
- **Labels:** always the Label typography role — uppercase, tracked-out, Parchment Dim — sitting directly above the field, never inline or floating.

### Navigation
- Fixed top bar, `max-w-4xl`, hairline bottom border. Links are Parchment Dim by default, Molten Gold + semibold when active (`aria-current="page"`) — the only place an active/selected state is communicated by color alone rather than gold + glow, because a nav bar is wayfinding, not a collectible.

### CardArt (signature component)
The holo-foil gradient border (`linear-gradient(135deg, {rarity}, #fff 45%, {rarity} 60%, {rarity-soft} 80%, {rarity})`) is a padding trick, not a border-image — a 3px padding reveals the gradient background as a ring. Layered inside: a diagonal repeating-gradient sheen (`115deg`, blended `overlay`), an SVG-noise grain layer and scratch marks whose opacity is driven by the card's real `float_value` (cosmetic wear, unique per exemplar), and a unified rarity+type medallion (top-left) plus a clip-path name banner (bottom) — both omitted in `compact` mode for small thumbnails. Locked (unowned) cards render as a flat hairline-bordered silhouette with a centered lock icon at 40% opacity — deliberately inert, no gradient, no glow, so an unowned card never competes visually with an owned one.

## Do's and Don'ts

### Do:
- **Do** reserve Molten Gold for the primary action and LEGENDARY rarity — never a decorative accent elsewhere on the same screen.
- **Do** let rarity be the only source of glow/shadow in the system (0/9/16/24px COMMON→LEGENDARY).
- **Do** use the serif display face only for content that should feel collectible-grade (titles, card names) — not for buttons or form labels.
- **Do** treat a primary action tied to a physical-collectible metaphor (opening a pack) as the object itself, not a separate button floating below it.

### Don't:
- **Don't** add drop shadows for generic UI hierarchy (dropdown menus, sticky headers) — depth comes from the surface/ground contrast (Charcoal vs. Slate vs. Void), not shadows.
- **Don't** introduce a second accent color alongside gold. Secondary/tertiary color only exists as the rarity ladder.
- **Don't** reach for celebratory mobile-freemium patterns — confetti, toast pop-ups, badge/streak counters — even for genuinely good news (a LEGENDARY pull, a completed trade). The existing pack-shake + glow language is the ceiling for celebration.
- **Don't** ship a light theme or a `prefers-color-scheme` variant. The identity is dark-only; `dark:` variants stay permanently inert behind a `.dark` class the app never applies.
