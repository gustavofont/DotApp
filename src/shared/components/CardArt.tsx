import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getWearStyle, gradeFromFloat, serialFromSeed } from "../cardWear";
import { RARITY_ACCENT, RARITY_ACCENT_SOFT, RARITY_GLOW } from "../rarity";
import { TypeIcon, type CardType } from "../typeIcons";

type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

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
  /** Present only for an owned exemplar — drives the wear treatment and the label's serial/grade. Omit for a catalog-only (unowned, or ownership-agnostic) card. */
  wear?: { floatValue: number; seed: number };
  /** Renders an empty, uncertified case instead of art — a catalog card the player doesn't own yet. */
  locked?: boolean;
  /** Hides the label strip — for small thumbnails (e.g. trade/pick grids) where the name is already shown as text alongside the art and the label has no room to stay legible. */
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
  const { t } = useTranslation();

  if (locked) {
    return (
      <div
        role="img"
        aria-label={t("cardArt.notObtainedAria", { name })}
        className={cn(
          "relative flex aspect-[3/4.2] flex-col overflow-hidden rounded-lg border border-dashed border-hairline bg-surface-2",
          className,
        )}
      >
        <div className="h-5 shrink-0 border-b border-dashed border-hairline" />
        <div className="flex flex-1 items-center justify-center opacity-40">
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
    // The case: a glassy, colorless acrylic edge (not a rarity-colored
    // border) — rarity now lives in the label's holo strip below.
    <div
      className={cn("aspect-[3/4.2] rounded-lg p-[3px]", className)}
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.24), rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.14) 75%, rgba(255,255,255,0.24))",
        boxShadow: glow > 0 ? `0 0 ${glow}px 0 color-mix(in srgb, ${accent} 45%, transparent)` : undefined,
      }}
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-[7px] bg-surface-2">
        {!compact ? (
          <div className="shrink-0">
            {/* Holo rarity strip — a thin certified-authenticity band. */}
            <div
              className="relative h-1 overflow-hidden"
              style={{ background: `linear-gradient(90deg, ${accent}, ${accentSoft}, ${accent})` }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(115deg, rgba(255,255,255,0.5) 0 2px, transparent 2px 6px)",
                  mixBlendMode: "overlay",
                }}
              />
            </div>

            <div className="px-1.5 py-1">
              {wear ? (
                <div className="flex items-center justify-between font-mono text-[8px] text-ink-faint">
                  <span>{serialFromSeed(wear.seed)}</span>
                  <span className="font-bold" style={{ color: accent }}>
                    GR {gradeFromFloat(wear.floatValue)}
                  </span>
                </div>
              ) : null}

              <p className="truncate font-serif text-[11px] font-semibold text-ink">{name}</p>

              <div className="flex min-w-0 items-center gap-1">
                <TypeIcon
                  type={cardType}
                  ink={accent}
                  cutout="var(--color-surface-2)"
                  className="h-2.5 w-2.5 shrink-0"
                />
                <span className="truncate font-mono text-[7px] tracking-wide text-ink-faint uppercase">
                  {t(`common.rarity.${rarity}`)} · {t(`common.cardType.${cardType}`)}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        <div className="relative min-h-0 flex-1 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              loading="lazy"
              className="h-full w-full object-cover"
              style={wearStyle ? { filter: wearStyle.filter } : undefined}
            />
          ) : compact ? (
            // Compact hides the label strip, so this is the only place the
            // name can appear. Non-compact skips it — the label above
            // already shows the name, and repeating it here would be a
            // second, differently-styled copy of the same text.
            <div className="flex h-full items-center justify-center bg-surface-2 p-2 text-center text-xs text-ink-faint">
              {name}
            </div>
          ) : (
            <div className="h-full bg-surface-2" />
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
        </div>
      </div>
    </div>
  );
}
