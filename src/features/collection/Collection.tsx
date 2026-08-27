import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dotCardClient } from "../../api/client";
import { CardArt } from "../../shared/components/CardArt";
import type { components } from "../../api/dotcard.types";

type CardResponseDto = components["schemas"]["CardResponseDto"];
type GeneratedCardResponseDto = components["schemas"]["GeneratedCardResponseDto"];

interface Group {
  card: CardResponseDto;
  exemplars: GeneratedCardResponseDto[];
}

export function Collection() {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const myCardsQuery = useQuery({
    queryKey: ["me", "cards"],
    queryFn: async () => {
      const { data, error } = await dotCardClient.GET("/me/cards", { params: { query: { limit: 100 } } });
      if (error) throw error;
      return data;
    },
  });

  const groups = useMemo(() => {
    const items = myCardsQuery.data?.items ?? [];
    const byCardId = new Map<number, Group>();

    for (const exemplar of items) {
      const existing = byCardId.get(exemplar.card.id);
      if (existing) {
        existing.exemplars.push(exemplar);
      } else {
        byCardId.set(exemplar.card.id, { card: exemplar.card, exemplars: [exemplar] });
      }
    }

    // Best copy (lowest float = "newest looking") represents the group when collapsed.
    for (const group of byCardId.values()) {
      group.exemplars.sort((a, b) => a.floatValue - b.floatValue);
    }

    return [...byCardId.values()].sort((a, b) => a.card.name.localeCompare(b.card.name));
  }, [myCardsQuery.data]);

  function toggle(cardId: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold text-ink">Meu acervo</h1>
        <span className="text-sm text-ink-faint">{myCardsQuery.data?.total ?? 0} cartas</span>
      </div>

      {myCardsQuery.isLoading ? <p className="text-ink-dim">Carregando…</p> : null}
      {myCardsQuery.error ? (
        <p className="text-destructive">Não foi possível carregar seu acervo.</p>
      ) : null}

      <div className="flex flex-col gap-3">
        {groups.map((group) => {
          const best = group.exemplars[0];
          const isExpanded = expanded.has(group.card.id);

          return (
            <div key={group.card.id} className="rounded-xl border border-hairline bg-surface">
              <button
                type="button"
                onClick={() => toggle(group.card.id)}
                className="flex w-full items-center gap-3 p-3 text-left"
              >
                <div className="relative w-14 shrink-0">
                  <CardArt
                    name={group.card.name}
                    imageUrl={group.card.imageUrl}
                    rarity={group.card.rarity}
                    cardType={group.card.type}
                    wear={{ floatValue: best.floatValue, seed: Number(best.id) }}
                    compact
                  />
                  {group.exemplars.length > 1 ? (
                    <span className="absolute -right-1 -bottom-1 rounded-full border-2 border-ground bg-legendary px-1.5 py-0.5 text-[10px] font-bold text-[#241a06]">
                      ×{group.exemplars.length}
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-sm font-semibold text-ink">
                    {group.card.name}
                  </p>
                  <p className="text-xs text-ink-faint">
                    {group.card.type} · {group.card.rarity}
                  </p>
                </div>
              </button>

              {isExpanded ? (
                <div className="flex flex-col gap-2 border-t border-hairline p-3 pt-2">
                  {group.exemplars.map((exemplar) => (
                    <div key={exemplar.id} className="flex items-center gap-3">
                      <div className="w-10 shrink-0">
                        <CardArt
                          name={group.card.name}
                          imageUrl={group.card.imageUrl}
                          rarity={group.card.rarity}
                          cardType={group.card.type}
                          wear={{ floatValue: exemplar.floatValue, seed: Number(exemplar.id) }}
                          compact
                        />
                      </div>
                      <div className="flex flex-1 justify-between text-xs">
                        <span className="text-ink-faint">#{exemplar.id}</span>
                        <span className="text-ink-dim">float {exemplar.floatValue.toFixed(7)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
