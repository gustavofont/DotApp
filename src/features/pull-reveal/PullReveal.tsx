import { useEffect, useState } from "react";
import { useMachine } from "@xstate/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { dotCardClient } from "../../api/client";
import { CardArt } from "../../shared/components/CardArt";
import { Button } from "../../components/ui/button";
import { pullMachine, type PackSize } from "./pullMachine";

const SIZE_OPTIONS: { size: PackSize; cost: number }[] = [
  { size: 1, cost: 1 },
  { size: 5, cost: 5 },
  { size: 10, cost: 10 },
];

export function PullReveal() {
  const [state, send] = useMachine(pullMachine);
  const queryClient = useQueryClient();

  const [collectionId, setCollectionId] = useState<number | null>(null);
  const [size, setSize] = useState<PackSize>(5);

  const collectionsQuery = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data, error } = await dotCardClient.GET("/collections");
      if (error) throw error;
      return data;
    },
  });

  // Default to "Kingdom of Eldrath" — the only collection with real card art
  // today. Falls back to whatever's first if that ever changes.
  useEffect(() => {
    if (collectionId === null && collectionsQuery.data && collectionsQuery.data.length > 0) {
      const preferred = collectionsQuery.data.find((c) => c.name === "Kingdom of Eldrath");
      setCollectionId((preferred ?? collectionsQuery.data[0]).id);
    }
  }, [collectionId, collectionsQuery.data]);

  // A finished pull means new cards and a new balance — invalidate what
  // Home and Collection show, without the machine knowing React Query exists.
  useEffect(() => {
    if (state.context.cards.length > 0) {
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      void queryClient.invalidateQueries({ queryKey: ["me", "cards"] });
    }
  }, [state.context.cards, queryClient]);

  const currentCard = state.context.cards[state.context.currentIndex];
  const isLegendary = currentCard?.card.rarity === "LEGENDARY";

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-center font-serif text-xl font-semibold text-ink">Abrir Pacote</h1>

      {state.matches("idle") ? (
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wide text-ink-faint uppercase">
              Coleção
            </label>
            <select
              value={collectionId ?? ""}
              onChange={(event) => setCollectionId(Number(event.target.value))}
              className="w-full rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-ink"
            >
              {collectionsQuery.data?.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wide text-ink-faint uppercase">
              Tamanho do pacote
            </label>
            <div className="flex gap-2">
              {SIZE_OPTIONS.map((option) => (
                <Button
                  key={option.size}
                  type="button"
                  variant={size === option.size ? "default" : "outline"}
                  onClick={() => setSize(option.size)}
                  className="flex-1"
                >
                  {option.size} · {option.cost} DP
                </Button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            disabled={collectionId === null}
            onClick={() => collectionId !== null && send({ type: "OPEN", collectionId, size })}
          >
            Abrir pacote
          </Button>
        </div>
      ) : null}

      {state.matches("opening") ? (
        <div className="flex flex-col items-center gap-4 py-10">
          <div className="relative h-56 w-40">
            {[10, 5, 0].map((offset, i) => (
              <div
                key={offset}
                className="absolute inset-0"
                style={{ transform: `translate(${offset / 2}px, ${offset / 2}px) rotate(${(i - 1) * 3}deg)` }}
              >
                <CardArt name="" imageUrl={null} rarity="COMMON" cardType="CREATURE" locked />
              </div>
            ))}
          </div>
          <p className="text-sm text-ink-dim">Abrindo…</p>
        </div>
      ) : null}

      {state.matches("revealing") && currentCard ? (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="relative w-48">
            {isLegendary ? (
              <div
                className="pointer-events-none absolute -inset-16 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, color-mix(in srgb, var(--color-legendary) 45%, transparent), transparent 65%)",
                }}
              />
            ) : null}
            <button
              type="button"
              aria-label="Revelar próxima carta"
              onClick={() => send({ type: "REVEAL_NEXT" })}
              className="relative block w-full cursor-pointer"
            >
              <CardArt
                name={currentCard.card.name}
                imageUrl={currentCard.card.imageUrl}
                rarity={currentCard.card.rarity}
                cardType={currentCard.card.type}
                wear={{ floatValue: currentCard.floatValue, seed: Number(currentCard.id) }}
              />
            </button>
          </div>

          {isLegendary ? (
            <p className="font-serif text-sm font-semibold text-legendary">Lendária!</p>
          ) : null}

          <div className="flex gap-1.5">
            {state.context.cards.map((_, i) => (
              <span
                key={i}
                className={
                  "h-1.5 w-1.5 rounded-full " +
                  (i <= state.context.currentIndex ? "bg-legendary" : "bg-hairline")
                }
              />
            ))}
          </div>
          <p className="text-xs text-ink-faint uppercase">
            {state.context.currentIndex + 1} de {state.context.cards.length} — toque para continuar
          </p>
        </div>
      ) : null}

      {state.matches("done") ? (
        <div className="flex flex-col gap-4 py-6">
          <p className="text-center text-ink-dim">Pacote aberto!</p>
          <div className="flex flex-col gap-2">
            {state.context.cards.map((c) => (
              <div
                key={c.id}
                className="flex justify-between rounded-lg border border-hairline bg-surface px-3 py-2 text-sm"
              >
                <span className="text-ink">{c.card.name}</span>
                <span className="text-ink-faint">{c.card.rarity}</span>
              </div>
            ))}
          </div>
          <Button type="button" onClick={() => send({ type: "RESET" })}>
            Abrir outro pacote
          </Button>
          <Link to="/collection" className="text-center text-sm text-ink-dim hover:text-ink">
            Ver acervo
          </Link>
        </div>
      ) : null}

      {state.matches("error") ? (
        <div className="flex flex-col gap-4 py-6 text-center">
          <p className="text-destructive">
            {state.context.error === "insufficient_balance"
              ? "Saldo insuficiente — resgate sua recompensa diária primeiro."
              : "Não foi possível abrir o pacote."}
          </p>
          <Button type="button" onClick={() => send({ type: "RESET" })}>
            Tentar de novo
          </Button>
        </div>
      ) : null}
    </div>
  );
}
