import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMachine } from "@xstate/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { dotCardClient } from "../../api/client";
import { CardArt } from "../../shared/components/CardArt";
import { Button } from "../../components/ui/button";
import { DEFAULT_PACK_COVER_URL, getPackCoverUrl } from "../../shared/assets";
import { unwrap } from "../../shared/apiUnwrap";
import { pullMachine, type PackSize } from "./pullMachine";

const SIZE_OPTIONS: { size: PackSize; cost: number }[] = [
  { size: 1, cost: 1 },
  { size: 5, cost: 5 },
  { size: 10, cost: 10 },
];

// A collection without its own uploaded cover falls back to the generic one.
function handlePackCoverError(event: React.SyntheticEvent<HTMLImageElement>): void {
  const img = event.currentTarget;
  if (img.src !== DEFAULT_PACK_COVER_URL) {
    img.src = DEFAULT_PACK_COVER_URL;
  }
}

export function PullReveal() {
  const { t } = useTranslation();
  const [state, send] = useMachine(pullMachine);
  const queryClient = useQueryClient();

  const [collectionId, setCollectionId] = useState<number | null>(null);
  const [size, setSize] = useState<PackSize>(5);

  const collectionsQuery = useQuery({
    queryKey: ["collections"],
    queryFn: () => unwrap(dotCardClient.GET("/collections")),
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
      <h1 className="mb-6 text-center font-serif text-xl font-semibold text-ink">{t("pull.title")}</h1>

      {state.matches("idle") ? (
        <div className="flex flex-col items-center gap-6">
          <div className="w-full">
            <label
              htmlFor="pull-collection"
              className="mb-1 block text-xs font-semibold tracking-wide text-ink-faint uppercase"
            >
              {t("pull.collection")}
            </label>
            <select
              id="pull-collection"
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

          <div className="w-full">
            <label className="mb-1 block text-xs font-semibold tracking-wide text-ink-faint uppercase">
              {t("pull.packSize")}
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

          <button
            type="button"
            aria-label={t("pull.openPackAria")}
            disabled={collectionId === null}
            onClick={() => collectionId !== null && send({ type: "OPEN", collectionId, size })}
            className="group w-56 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl shadow-[0_0_44px_-6px_color-mix(in_srgb,var(--color-legendary)_45%,transparent)] transition-transform duration-200 ease-out group-hover:scale-[1.03] group-active:scale-[0.97]">
              <img
                src={getPackCoverUrl(collectionId)}
                onError={handlePackCoverError}
                alt={t("pull.packCoverAlt")}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/75 via-black/10 to-transparent px-3 pt-3 pb-8">
                <p className="text-center font-serif text-base font-semibold tracking-wide text-legendary-soft">
                  DotCard
                </p>
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent px-3 pt-8 pb-3">
                <p className="text-center text-sm font-semibold text-ink">
                  {t("pull.cardCount", { count: size })} ·{" "}
                  {SIZE_OPTIONS.find((o) => o.size === size)?.cost} DP
                </p>
              </div>
            </div>
          </button>
          <p className="-mt-3 text-xs tracking-wide text-ink-faint uppercase">
            {t("pull.tapToOpen")}
          </p>
        </div>
      ) : null}

      {state.matches("opening") ? (
        <div className="flex flex-col items-center gap-6 py-10">
          <div className="relative w-56">
            <div
              className="pack-glow-pulse pointer-events-none absolute -inset-10 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in srgb, var(--color-legendary) 55%, transparent), transparent 70%)",
              }}
            />
            <div className="pack-shake relative aspect-[2/3] overflow-hidden rounded-2xl shadow-[0_0_60px_-4px_color-mix(in_srgb,var(--color-legendary)_60%,transparent)]">
              <img
                src={getPackCoverUrl(collectionId)}
                onError={handlePackCoverError}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/75 via-black/10 to-transparent px-3 pt-3 pb-8">
                <p className="text-center font-serif text-base font-semibold tracking-wide text-legendary-soft">
                  DotCard
                </p>
              </div>
            </div>
          </div>
          <p className="animate-pulse text-sm text-ink-dim">{t("pull.opening")}</p>
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
              aria-label={t("pull.revealNextAria")}
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
            <p className="font-serif text-sm font-semibold text-legendary">{t("pull.legendary")}</p>
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
            {t("pull.progress", {
              current: state.context.currentIndex + 1,
              total: state.context.cards.length,
            })}
          </p>
        </div>
      ) : null}

      {state.matches("done") ? (
        <div className="flex flex-col gap-4 py-6">
          <p className="text-center text-ink-dim">{t("pull.done")}</p>
          <div className="flex flex-col gap-2">
            {state.context.cards.map((c) => (
              <div
                key={c.id}
                className="flex justify-between rounded-lg border border-hairline bg-surface px-3 py-2 text-sm"
              >
                <span className="text-ink">{c.card.name}</span>
                <span className="text-ink-faint">{t(`common.rarity.${c.card.rarity}`)}</span>
              </div>
            ))}
          </div>
          <Button type="button" onClick={() => send({ type: "RESET" })}>
            {t("pull.openAnother")}
          </Button>
          <Link to="/catalog" className="text-center text-sm text-ink-dim hover:text-ink">
            {t("pull.viewCatalog")}
          </Link>
        </div>
      ) : null}

      {state.matches("error") ? (
        <div className="flex flex-col gap-4 py-6 text-center">
          <p className="text-destructive">
            {state.context.error === "insufficient_balance"
              ? t("pull.insufficientBalance")
              : t("pull.genericError")}
          </p>
          <Button type="button" onClick={() => send({ type: "RESET" })}>
            {t("pull.tryAgain")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
