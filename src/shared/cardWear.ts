/**
 * Turns a generated_card's float_value into a visual "wear" treatment —
 * lower float reads as newer, higher float reads as more worn. Validated as
 * an HTML prototype before being ported here (DotApp/SCOPE.md §5); the
 * prototype lives at the path referenced in that doc for comparison if this
 * ever drifts from what was agreed on.
 *
 * Pure computation only — no DOM/JSX here. A component (e.g. a future
 * shared/components/CardArt.tsx) applies `filter` to the <img> and renders
 * `scratchLayersMarkup` via dangerouslySetInnerHTML in an absolutely
 * positioned wrapper, alongside its own static grain/corner-wear/vignette
 * CSS scaled by the opacity values returned here.
 */

export interface WearStyle {
  /** CSS filter string — apply to the card art <img>'s style.filter. */
  filter: string;
  /** 0 at float=0, scales up with wear — drive the grain overlay's opacity. */
  grainOpacity: number;
  /** 0 at float=0, scales up with wear — drive the 4 corner-smudge divs' opacity. */
  cornerOpacity: number;
  /** Ready-to-use inset box-shadow value for the edge vignette. */
  vignetteBoxShadow: string;
  /** Raw markup for the three scratch layers (hairlines/scuffs/gouges) — render via dangerouslySetInnerHTML. */
  scratchLayersMarkup: string;
}

export function getWearStyle(floatValue: number, seed: number): WearStyle {
  const f = clamp01(floatValue);

  return {
    filter: wearFilter(f),
    grainOpacity: round2(f * 0.3),
    cornerOpacity: round2(f * 0.7),
    vignetteBoxShadow: `inset 0 0 40px 10px rgba(0,0,0,${round2(0.3 + f * 0.5)})`,
    scratchLayersMarkup: wearLayers(f, seed),
  };
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function wearFilter(f: number): string {
  const saturate = round2(1 - f * 0.55);
  const sepia = round2(f * 0.4);
  const contrast = round2(1 - f * 0.18);
  const brightness = round2(1 - f * 0.1);
  return `saturate(${saturate}) sepia(${sepia}) contrast(${contrast}) brightness(${brightness})`;
}

/** Deterministic PRNG (mulberry-ish LCG) — same seed always draws the same scratches. */
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Pushes samples toward 0 and 1 — wear concentrates near edges/corners, not the whole face. */
function edgeBias(t: number): number {
  return t < 0.5 ? (2 * t) ** 1.7 / 2 : 1 - ((2 * (1 - t)) ** 1.7) / 2;
}

interface ScratchLayerOptions {
  countScale: number;
  color: "white" | "black";
  blend: "screen" | "multiply";
  minLen: number;
  maxLen: number;
  widthMin: number;
  widthMax: number;
  angleSpread: number;
  baseOpacity: number;
}

function scratchLayer(f: number, seed: number, idNamespace: string, opts: ScratchLayerOptions): string {
  const count = Math.round(f * opts.countScale);
  if (count === 0) return "";

  const rand = seededRandom(seed);
  const dominantAngle = rand() * Math.PI * 2;
  let defs = "";
  let paths = "";

  for (let i = 0; i < count; i++) {
    const x1 = edgeBias(rand()) * 100;
    const y1 = edgeBias(rand()) * 140;
    const angle = dominantAngle + (rand() - 0.5) * opts.angleSpread;
    const len = opts.minLen + rand() * (opts.maxLen - opts.minLen);
    const bend = (rand() - 0.5) * len * 0.35;
    const x2 = x1 + Math.cos(angle) * len;
    const y2 = y1 + Math.sin(angle) * len;
    const mx = (x1 + x2) / 2 - Math.sin(angle) * bend;
    const my = (y1 + y2) / 2 + Math.cos(angle) * bend;
    const w = opts.widthMin + rand() * (opts.widthMax - opts.widthMin);
    const op = opts.baseOpacity * (0.45 + rand() * 0.55) * Math.min(1, f * 1.3);
    const id = `sc${idNamespace}_${i}`;

    defs += `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}">
      <stop offset="0%" stop-color="${opts.color}" stop-opacity="0"/>
      <stop offset="20%" stop-color="${opts.color}" stop-opacity="${round2(op)}"/>
      <stop offset="80%" stop-color="${opts.color}" stop-opacity="${round2(op)}"/>
      <stop offset="100%" stop-color="${opts.color}" stop-opacity="0"/>
    </linearGradient>`;
    paths += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="url(#${id})" stroke-width="${w.toFixed(2)}" fill="none" stroke-linecap="round"/>`;
  }

  return `<svg viewBox="0 0 100 140" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;mix-blend-mode:${opts.blend}"><defs>${defs}</defs>${paths}</svg>`;
}

function wearLayers(f: number, seedBase: number): string {
  // RNG seeds (seedBase+1/+2/+3) can collide across adjacent exemplars —
  // e.g. exemplar 85's "scuffs" (seed 87) vs exemplar 86's "hairlines"
  // (seed 87) — so gradient ids are namespaced by seedBase + layer name,
  // not by the (colliding) shifted seed, to stay unique when many CardArts
  // render on the same page (a grid, a picker) and share `<defs>` scope.
  // Many fine hairlines — the bulk of ordinary handling wear.
  const hairlines = scratchLayer(f, seedBase + 1, `${seedBase}h`, {
    countScale: 16,
    color: "white",
    blend: "screen",
    minLen: 3,
    maxLen: 11,
    widthMin: 0.12,
    widthMax: 0.28,
    angleSpread: Math.PI * 0.9,
    baseOpacity: 0.32,
  });
  // A few bolder scuffs — catch more light, read as real gouges.
  const scuffs = scratchLayer(f, seedBase + 2, `${seedBase}s`, {
    countScale: 3.5,
    color: "white",
    blend: "screen",
    minLen: 12,
    maxLen: 30,
    widthMin: 0.4,
    widthMax: 0.85,
    angleSpread: Math.PI * 0.5,
    baseOpacity: 0.48,
  });
  // A couple of dark gouges — deeper damage, sparse.
  const gouges = scratchLayer(f, seedBase + 3, `${seedBase}g`, {
    countScale: 2.2,
    color: "black",
    blend: "multiply",
    minLen: 8,
    maxLen: 20,
    widthMin: 0.3,
    widthMax: 0.6,
    angleSpread: Math.PI * 0.6,
    baseOpacity: 0.38,
  });
  return hairlines + scuffs + gouges;
}

// "The Grading Slab" direction — a PSA/BGS-style 0-10 grade and cert serial,
// both purely derived from data the app already has (float_value, the
// exemplar's own id). Lower float = better condition, same convention the
// app already used to pick a card's "best" copy.
export function gradeFromFloat(floatValue: number): string {
  return ((1 - floatValue) * 10).toFixed(1);
}

export function serialFromSeed(seed: number): string {
  return `NO. ${String(seed).padStart(6, "0")}`;
}
