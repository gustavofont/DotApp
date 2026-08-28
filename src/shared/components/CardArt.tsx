import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getWearStyle } from "../cardWear";
import { TypeIcon, type CardType } from "../typeIcons";

type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

// Mirrors RARITY_STYLE in DotCardGenerator/card_composer.py — same accent
// colors and glow escalation, now driving a CSS-only frame instead of a
// frame baked into the served image (DotApp/SCOPE.md §2).
const RARITY_ACCENT: Record<Rarity, string> = {
  COMMON: "var(--color-common)",
  RARE: "var(--color-rare)",
  EPIC: "var(--color-epic)",
  LEGENDARY: "var(--color-legendary)",
};

const RARITY_ACCENT_SOFT: Record<Rarity, string> = {
  COMMON: "#c7c7cc",
  RARE: "#7fb0f0",
  EPIC: "#c584f0",
  LEGENDARY: "var(--color-legendary-soft)",
};

const RARITY_GLOW: Record<Rarity, number> = {
  COMMON: 0,
  RARE: 9,
  EPIC: 16,
  LEGENDARY: 24,
};

// Ported from the wear prototype's `.grain` layer — SVG feTurbulence, blended
// with `overlay` so it reads as fine paper/photo grain rather than static.
const GRAIN_DATA_URI =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

const CORNERS = [
  { key: "tl", style: { top: "-8%", left: "-8%" } },
  { key: "tr", style: { top: "-8%", right: "-8%" } },
  { key: "bl", style: { bottom: "-8%", left: "-8%" } },
  { key: "br", style: { bottom: "-8%", right: "-8%" } },
] as const;

export interface CardArtProps {
  name: string;
  imageUrl: string | null;
  rarity: Rarity;
  cardType: CardType;
  /** Present only for an owned exemplar — drives the wear treatment. Omit for a catalog-only (unowned, or ownership-agnostic) card. */
  wear?: { floatValue: number; seed: number };
  /** Renders a locked silhouette instead of art — a catalog card the player doesn't own yet. */
  locked?: boolean;
  /** Hides the medallion and name banner — for small thumbnails (e.g. Collection's list rows) where the name is already shown as text alongside the art and the banner has no room to stay legible. */
  compact?: boolean;
  className?: string;
}

export function CardArt({
  name,
  imageUrl,
  rarity,
  cardType,
  wear,
  locked,
  compact,
  className,
}: CardArtProps) {
  if (locked) {
    return (
      <div
        role="img"
        aria-label={`${name} (ainda não obtida)`}
        className={cn(
          "relative aspect-[3/4.2] overflow-hidden rounded-2xl border border-hairline bg-surface-2",
          className,
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <Lock className="h-6 w-6 text-ink-faint" />
        </div>
      </div>
    );
  }

  const accent = RARITY_ACCENT[rarity];
  const accentSoft = RARITY_ACCENT_SOFT[rarity];
  const glow = RARITY_GLOW[rarity];
  const wearStyle = wear ? getWearStyle(wear.floatValue, wear.seed) : null;

  return (
    // Holo-foil border: the gradient background *is* the border, showing
    // through a small padding — no border-image needed.
    <div
      className={cn("aspect-[3/4.2] rounded-2xl p-[3px]", className)}
      style={{
        background: `linear-gradient(135deg, ${accent}, #fff 45%, ${accent} 60%, ${accentSoft} 80%, ${accent})`,
        boxShadow: glow > 0 ? `0 0 ${glow * 1.2}px 0 color-mix(in srgb, ${accent} 45%, transparent)` : undefined,
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[13px]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover"
            style={wearStyle ? { filter: wearStyle.filter } : undefined}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-surface-2 p-2 text-center text-xs text-ink-faint">
            {name}
          </div>
        )}

        {wearStyle ? (
          <>
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: GRAIN_DATA_URI,
                mixBlendMode: "overlay",
                opacity: wearStyle.grainOpacity,
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              // Layered <svg> scratch markup from getWearStyle — see shared/cardWear.ts.
              dangerouslySetInnerHTML={{ __html: wearStyle.scratchLayersMarkup }}
            />
            {CORNERS.map((corner) => (
              <div
                key={corner.key}
                className="pointer-events-none absolute h-1/3 w-[46%]"
                style={{
                  ...corner.style,
                  opacity: wearStyle.cornerOpacity,
                  background: "radial-gradient(ellipse at center, rgba(20,16,10,0.9), transparent 70%)",
                  mixBlendMode: "multiply",
                }}
              />
            ))}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: wearStyle.vignetteBoxShadow }}
            />
          </>
        ) : null}

        {imageUrl ? (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(115deg, rgba(255,255,255,0.14) 0 5px, transparent 5px 24px)",
              mixBlendMode: "overlay",
            }}
          />
        ) : null}

        {!compact ? (
          <>
            {/* Rarity + type medallion, unified — not two separate badges. */}
            <div
              className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full"
              style={{
                background: `radial-gradient(circle at 35% 30%, ${accentSoft}, ${accent})`,
                boxShadow: `0 0 8px ${accent}, 0 0 0 2px rgba(0,0,0,0.6)`,
              }}
            >
              <TypeIcon type={cardType} ink="#0c0c0e" cutout={accent} className="h-4 w-4" />
            </div>

            {imageUrl ? (
              <div
                className="absolute bottom-[9%] left-1/2 -translate-x-1/2 px-4 py-1 font-serif text-xs font-bold whitespace-nowrap text-[#0c0c0e]"
                style={{
                  background: `linear-gradient(180deg, ${accentSoft}, ${accent})`,
                  clipPath: "polygon(6% 0, 94% 0, 100% 50%, 94% 100%, 6% 100%, 0 50%)",
                }}
              >
                {name}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
