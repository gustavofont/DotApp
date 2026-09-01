type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

// Mirrors RARITY_STYLE in DotCardGenerator/card_composer.py — same accent
// colors and glow escalation. Single source of truth for every place that
// needs to color something by rarity (CardArt's label, the exemplar list,
// the duplicate-count badge) so gold stays reserved for LEGENDARY instead
// of leaking onto other rarities in some call sites and not others
// (DESIGN.md — The Reserved Gold Rule).
export const RARITY_ACCENT: Record<Rarity, string> = {
  COMMON: "var(--color-common)",
  RARE: "var(--color-rare)",
  EPIC: "var(--color-epic)",
  LEGENDARY: "var(--color-legendary)",
};

export const RARITY_ACCENT_SOFT: Record<Rarity, string> = {
  COMMON: "#c7c7cc",
  RARE: "#7fb0f0",
  EPIC: "#c584f0",
  LEGENDARY: "var(--color-legendary-soft)",
};

export const RARITY_GLOW: Record<Rarity, number> = {
  COMMON: 0,
  RARE: 9,
  EPIC: 16,
  LEGENDARY: 24,
};

// Ordinal, not a visual value — for ranking exemplars by rarity (e.g. Home's
// "rarest cards" showcase). Deliberately separate from RARITY_GLOW so a
// future change to glow px doesn't silently reorder rankings.
export const RARITY_RANK: Record<Rarity, number> = {
  COMMON: 0,
  RARE: 1,
  EPIC: 2,
  LEGENDARY: 3,
};
