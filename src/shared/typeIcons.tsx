/**
 * The 4 card-type glyphs — bold, flat silhouettes, one clear match per type:
 *   LAND -> tree, SORCERY -> flame, ARTIFACT -> rune, CREATURE -> skull.
 *
 * Ported from the CSS-only frame prototype validated before this component
 * existed (frame_models_template.html's TYPE_ICONS) — same shapes, same
 * relative proportions (viewBox 0 0 24 24, centered at 12,12, radius ~9),
 * just JSX instead of template-string SVG markup.
 */

export type CardType = "CREATURE" | "LAND" | "SORCERY" | "ARTIFACT";

export interface TypeIconProps {
  type: CardType;
  /** Main silhouette color. */
  ink: string;
  /** Fill for the "cutout" details (eye sockets, inner flame, inner rune ring, teeth gaps) — should match whatever the icon sits on. */
  cutout: string;
  className?: string;
}

function TreeIcon({ ink, className }: { ink: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={ink} className={className}>
      <rect x="11.19" y="15.6" width="1.62" height="4.05" />
      <polygon points="12,3.45 8.22,9.75 15.78,9.75" />
      <polygon points="12,7.05 6.78,15.78 17.22,15.78" />
    </svg>
  );
}

function FlameIcon({ ink, cutout, className }: { ink: string; cutout: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <polygon fill={ink} points="12,1.5 16,8.5 15,12.5 16.8,16.2 13.8,22.5 12,20 10.2,22.5 7.2,16.2 9,12.5 8,8.5" />
      <polygon fill={cutout} points="12,6.5 13.8,11.5 13.2,14.5 14,17.5 12,20 10,17.5 10.8,14.5 10.2,11.5" />
    </svg>
  );
}

const RUNE_TICK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function RuneIcon({ ink, cutout, className }: { ink: string; cutout: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx={12} cy={12} r={5.4} fill={ink} />
      <circle cx={12} cy={12} r={3.6} fill={cutout} />
      <circle cx={12} cy={12} r={1.35} fill={ink} />
      {RUNE_TICK_ANGLES.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 12 + Math.cos(rad) * 5.67;
        const y1 = 12 + Math.sin(rad) * 5.67;
        const x2 = 12 + Math.cos(rad) * 7.29;
        const y2 = 12 + Math.sin(rad) * 7.29;
        return (
          <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={0.9} strokeLinecap="round" />
        );
      })}
    </svg>
  );
}

function SkullIcon({ ink, cutout, className }: { ink: string; cutout: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <ellipse cx={12} cy={11.3} rx={5.22} ry={4.24} fill={ink} />
      <rect x={9.39} y={12.63} width={5.22} height={2.81} fill={ink} />
      <circle cx={9.57} cy={11.64} r={1.35} fill={cutout} />
      <circle cx={14.43} cy={11.64} r={1.35} fill={cutout} />
      <polygon fill={cutout} points="12,12.15 11.3,13.5 12.7,13.5" />
      <rect x={10.83} y={13.9} width={0.5} height={1.3} fill={cutout} />
      <rect x={11.75} y={13.9} width={0.5} height={1.3} fill={cutout} />
      <rect x={12.67} y={13.9} width={0.5} height={1.3} fill={cutout} />
    </svg>
  );
}

export function TypeIcon({ type, ink, cutout, className }: TypeIconProps) {
  switch (type) {
    case "LAND":
      return <TreeIcon ink={ink} className={className} />;
    case "SORCERY":
      return <FlameIcon ink={ink} cutout={cutout} className={className} />;
    case "ARTIFACT":
      return <RuneIcon ink={ink} cutout={cutout} className={className} />;
    case "CREATURE":
      return <SkullIcon ink={ink} cutout={cutout} className={className} />;
  }
}
