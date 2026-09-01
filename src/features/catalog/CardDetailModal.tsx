import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { dotCardClient } from "../../api/client";
import { CardArt } from "../../shared/components/CardArt";
import { gradeFromFloat } from "../../shared/cardWear";
import { RARITY_ACCENT } from "../../shared/rarity";
import type { components } from "../../api/dotcard.types";

type InventoryCardResponseDto = components["schemas"]["InventoryCardResponseDto"];
type ExemplarResponseDto = components["schemas"]["ExemplarResponseDto"];
type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

/**
 * The individual-exemplar list (id + float) — split out from the modal body
 * because Trades will need the same "pick one specific copy" list when
 * proposing a trade (SCOPE.md §4: "a view expandida é a mesma usada pra
 * escolher um exemplar específico ao propor uma troca").
 */
export function ExemplarList({
  exemplars,
  rarity,
}: {
  exemplars: ExemplarResponseDto[];
  rarity: Rarity;
}) {
  return (
    <div className="flex flex-col gap-2">
      {exemplars.map((exemplar) => (
        <div
          key={exemplar.id}
          className="flex justify-between rounded-sm border border-hairline bg-surface-2 px-3 py-2 font-mono text-xs"
        >
          <span className="text-ink-faint">#{exemplar.id}</span>
          <span className="font-bold" style={{ color: RARITY_ACCENT[rarity] }}>
            GR {gradeFromFloat(exemplar.floatValue)}
          </span>
        </div>
      ))}
    </div>
  );
}

export interface CardDetailModalProps {
  card: InventoryCardResponseDto | null;
  onOpenChange: (open: boolean) => void;
}

export function CardDetailModal({ card, onOpenChange }: CardDetailModalProps) {
  const { t } = useTranslation();
  const owned = card?.ownership != null;

  // Every real exemplar (serial + float) — fetched only once the modal is
  // actually open for an owned card, never upfront. The best exemplar
  // (for the art's own wear) is already known from `card.ownership`, so
  // this fetch only feeds the list below it.
  const exemplarsQuery = useQuery({
    queryKey: ["me", "inventory", card?.id, "exemplars"],
    queryFn: async () => {
      const { data, error } = await dotCardClient.GET("/me/inventory/{cardId}/exemplars", {
        params: { path: { cardId: card!.id } },
      });
      if (error) throw error;
      return data;
    },
    enabled: card !== null && owned,
  });

  return (
    <Dialog open={card !== null} onOpenChange={onOpenChange}>
      {card ? (
        <DialogContent className="max-w-xs">
          <DialogTitle className="font-serif text-lg">{card.name}</DialogTitle>
          <DialogDescription>
            {t(`common.cardType.${card.type}`)} · {t(`common.rarity.${card.rarity}`)}
          </DialogDescription>

          <div className="mx-auto w-40">
            <CardArt
              name={card.name}
              imageUrl={card.imageUrl}
              rarity={card.rarity}
              cardType={card.type}
              locked={!owned}
              wear={
                card.ownership
                  ? { floatValue: card.ownership.bestFloatValue, seed: Number(card.ownership.bestGeneratedCardId) }
                  : undefined
              }
            />
          </div>

          {owned ? (
            exemplarsQuery.data ? (
              <ExemplarList exemplars={exemplarsQuery.data} rarity={card.rarity} />
            ) : (
              <p className="text-center text-sm text-ink-dim">{t("common.loading")}</p>
            )
          ) : (
            <p className="text-center text-sm text-ink-faint">{t("cardDetail.notObtained")}</p>
          )}
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
