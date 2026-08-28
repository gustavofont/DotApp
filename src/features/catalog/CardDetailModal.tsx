import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { CardArt } from "../../shared/components/CardArt";
import { gradeFromFloat, serialFromSeed } from "../../shared/cardWear";
import { RARITY_ACCENT } from "../../shared/rarity";
import type { components } from "../../api/dotcard.types";

type CardResponseDto = components["schemas"]["CardResponseDto"];
type GeneratedCardResponseDto = components["schemas"]["GeneratedCardResponseDto"];

/**
 * The individual-exemplar list (id + float) — split out from the modal body
 * because Trades will need the same "pick one specific copy" list when
 * proposing a trade (SCOPE.md §4: "a view expandida é a mesma usada pra
 * escolher um exemplar específico ao propor uma troca").
 */
export function ExemplarList({ exemplars }: { exemplars: GeneratedCardResponseDto[] }) {
  return (
    <div className="flex flex-col gap-2">
      {exemplars.map((exemplar) => (
        <div
          key={exemplar.id}
          className="flex justify-between rounded-sm border border-hairline bg-surface-2 px-3 py-2 font-mono text-xs"
        >
          <span className="text-ink-faint">{serialFromSeed(Number(exemplar.id))}</span>
          <span className="font-bold" style={{ color: RARITY_ACCENT[exemplar.card.rarity] }}>
            GR {gradeFromFloat(exemplar.floatValue)}
          </span>
        </div>
      ))}
    </div>
  );
}

export interface CardDetailModalProps {
  card: CardResponseDto | null;
  exemplars: GeneratedCardResponseDto[];
  onOpenChange: (open: boolean) => void;
}

export function CardDetailModal({ card, exemplars, onOpenChange }: CardDetailModalProps) {
  const owned = exemplars.length > 0;
  // Lowest float = best condition — same convention as the grid badge.
  const best = owned ? [...exemplars].sort((a, b) => a.floatValue - b.floatValue)[0] : null;

  return (
    <Dialog open={card !== null} onOpenChange={onOpenChange}>
      {card ? (
        <DialogContent className="max-w-xs">
          <DialogTitle className="font-serif text-lg">{card.name}</DialogTitle>
          <DialogDescription>
            {card.type} · {card.rarity}
          </DialogDescription>

          <div className="mx-auto w-40">
            <CardArt
              name={card.name}
              imageUrl={card.imageUrl}
              rarity={card.rarity}
              cardType={card.type}
              locked={!owned}
              wear={best ? { floatValue: best.floatValue, seed: Number(best.id) } : undefined}
            />
          </div>

          {owned ? (
            <ExemplarList exemplars={exemplars} />
          ) : (
            <p className="text-center text-sm text-ink-faint">Ainda não obtida.</p>
          )}
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
