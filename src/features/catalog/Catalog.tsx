import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dotCardClient } from "../../api/client";
import { CardArt } from "../../shared/components/CardArt";
import { Button } from "../../components/ui/button";

type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
type CardType = "CREATURE" | "LAND" | "SORCERY" | "ARTIFACT";

const RARITIES: Rarity[] = ["COMMON", "RARE", "EPIC", "LEGENDARY"];
const TYPES: CardType[] = ["CREATURE", "LAND", "SORCERY", "ARTIFACT"];

export function Catalog() {
  const [rarityFilter, setRarityFilter] = useState<Rarity | null>(null);
  const [typeFilter, setTypeFilter] = useState<CardType | null>(null);

  const cardsQuery = useQuery({
    queryKey: ["cards"],
    queryFn: async () => {
      const { data, error } = await dotCardClient.GET("/cards", { params: { query: { limit: 100 } } });
      if (error) throw error;
      return data;
    },
  });

  const myCardsQuery = useQuery({
    queryKey: ["me", "cards"],
    queryFn: async () => {
      const { data, error } = await dotCardClient.GET("/me/cards", { params: { query: { limit: 100 } } });
      if (error) throw error;
      return data;
    },
  });

  const ownedCardIds = useMemo(() => {
    const items = myCardsQuery.data?.items ?? [];
    return new Set(items.map((exemplar) => exemplar.card.id));
  }, [myCardsQuery.data]);

  const cards = cardsQuery.data?.items ?? [];
  const filteredCards = cards.filter((card) => {
    if (rarityFilter && card.rarity !== rarityFilter) return false;
    if (typeFilter && card.type !== typeFilter) return false;
    return true;
  });

  const isLoading = cardsQuery.isLoading || myCardsQuery.isLoading;
  const error = cardsQuery.error ?? myCardsQuery.error;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold text-ink">Catálogo</h1>
        {cardsQuery.data ? (
          <span className="text-sm text-ink-faint">
            {ownedCardIds.size} / {cardsQuery.data.total}
          </span>
        ) : null}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={rarityFilter === null ? "default" : "outline"}
          onClick={() => setRarityFilter(null)}
        >
          Todas
        </Button>
        {RARITIES.map((rarity) => (
          <Button
            key={rarity}
            type="button"
            size="sm"
            variant={rarityFilter === rarity ? "default" : "outline"}
            onClick={() => setRarityFilter(rarityFilter === rarity ? null : rarity)}
          >
            {rarity}
          </Button>
        ))}
        <span className="mx-1 self-center text-hairline">|</span>
        {TYPES.map((type) => (
          <Button
            key={type}
            type="button"
            size="sm"
            variant={typeFilter === type ? "default" : "outline"}
            onClick={() => setTypeFilter(typeFilter === type ? null : type)}
          >
            {type}
          </Button>
        ))}
      </div>

      {isLoading ? <p className="text-ink-dim">Carregando…</p> : null}
      {error ? <p className="text-destructive">Não foi possível carregar o catálogo.</p> : null}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {filteredCards.map((card) => (
          <div key={card.id}>
            <CardArt
              name={card.name}
              imageUrl={card.imageUrl}
              rarity={card.rarity}
              cardType={card.type}
              locked={!ownedCardIds.has(card.id)}
            />
            <p className="mt-1 truncate text-xs text-ink-dim">{card.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
