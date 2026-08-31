import { useTranslation } from "react-i18next";
import { CardArt } from "../../shared/components/CardArt";
import type { components } from "../../api/dotcard.types";

type GeneratedCardResponseDto = components["schemas"]["GeneratedCardResponseDto"];

export interface CardPickerProps {
  cards: GeneratedCardResponseDto[];
  onSelect: (exemplar: GeneratedCardResponseDto) => void;
}

export function CardPicker({ cards, onSelect }: CardPickerProps) {
  const { t } = useTranslation();

  if (cards.length === 0) {
    return <p className="text-sm text-ink-faint">{t("cardPicker.empty")}</p>;
  }

  return (
    <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-5">
      {cards.map((exemplar) => (
        <button
          key={exemplar.id}
          type="button"
          onClick={() => onSelect(exemplar)}
          className="text-left"
        >
          <CardArt
            name={exemplar.card.name}
            imageUrl={exemplar.card.imageUrl}
            rarity={exemplar.card.rarity}
            cardType={exemplar.card.type}
            wear={{ floatValue: exemplar.floatValue, seed: Number(exemplar.id) }}
            compact
          />
        </button>
      ))}
    </div>
  );
}
