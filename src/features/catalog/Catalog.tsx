import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { dotCardClient } from "../../api/client";
import { CardArt } from "../../shared/components/CardArt";
import { Button } from "../../components/ui/button";
import { RARITY_ACCENT } from "../../shared/rarity";
import { CardDetailModal } from "./CardDetailModal";
import type { components } from "../../api/dotcard.types";

type InventoryCardResponseDto = components["schemas"]["InventoryCardResponseDto"];
type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
type CardType = "CREATURE" | "LAND" | "SORCERY" | "ARTIFACT";

const RARITIES: Rarity[] = ["COMMON", "RARE", "EPIC", "LEGENDARY"];
const TYPES: CardType[] = ["CREATURE", "LAND", "SORCERY", "ARTIFACT"];

// Skips layout/paint for whatever's off-screen — cheap, native, no library.
// Collections are curated and small (SCOPE.md §13), so a rough intrinsic
// size is fine; `auto` lets the browser use the real size once measured.
const LAZY_SECTION_STYLE = {
  contentVisibility: "auto",
  containIntrinsicSize: "auto 400px",
} as const;

interface InventoryPage {
  collectionId: number;
  collectionName: string;
  items: InventoryCardResponseDto[];
}

export function Catalog() {
  const { t } = useTranslation();
  const [rarityFilter, setRarityFilter] = useState<Rarity | null>(null);
  const [typeFilter, setTypeFilter] = useState<CardType | null>(null);
  const [selectedCard, setSelectedCard] = useState<InventoryCardResponseDto | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const collectionsQuery = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data, error } = await dotCardClient.GET("/collections");
      if (error) throw error;
      return data;
    },
  });
  const collections = collectionsQuery.data ?? [];

  // One page per collection, loaded in order — never "give me everything",
  // only the next collection, and only once the user actually scrolls to
  // where it would appear.
  const inventoryQuery = useInfiniteQuery({
    queryKey: ["me", "inventory", collections.map((c) => c.id)],
    queryFn: async ({ pageParam }: { pageParam: number }): Promise<InventoryPage> => {
      const collection = collections[pageParam];
      const { data, error } = await dotCardClient.GET("/me/inventory", {
        params: { query: { collectionId: collection.id } },
      });
      if (error) throw error;
      return { collectionId: collection.id, collectionName: collection.name, items: data };
    },
    initialPageParam: 0,
    getNextPageParam: (_lastPage, allPages) =>
      allPages.length < collections.length ? allPages.length : undefined,
    enabled: collections.length > 0,
  });

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = inventoryQuery;
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const pages = inventoryQuery.data?.pages ?? [];

  function matchesFilters(card: InventoryCardResponseDto): boolean {
    if (rarityFilter && card.rarity !== rarityFilter) return false;
    if (typeFilter && card.type !== typeFilter) return false;
    return true;
  }

  const ownedSoFar = pages.reduce(
    (sum, page) => sum + page.items.filter((card) => card.ownership !== null).length,
    0,
  );
  const loadedSoFar = pages.reduce((sum, page) => sum + page.items.length, 0);

  const isLoading = collectionsQuery.isLoading || inventoryQuery.isLoading;
  const error = collectionsQuery.error ?? inventoryQuery.error;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold text-ink">{t("catalog.title")}</h1>
        {pages.length > 0 ? (
          <span className="text-sm text-ink-faint">
            {ownedSoFar} / {loadedSoFar}
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
          {t("catalog.all")}
        </Button>
        {RARITIES.map((rarity) => (
          <Button
            key={rarity}
            type="button"
            size="sm"
            variant={rarityFilter === rarity ? "default" : "outline"}
            onClick={() => setRarityFilter(rarityFilter === rarity ? null : rarity)}
          >
            {t(`common.rarity.${rarity}`)}
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
            {t(`common.cardType.${type}`)}
          </Button>
        ))}
      </div>

      {isLoading ? <p className="text-ink-dim">{t("common.loading")}</p> : null}
      {error ? <p className="text-destructive">{t("catalog.loadError")}</p> : null}

      {pages.map((page) => {
        const filtered = page.items.filter(matchesFilters);
        if (filtered.length === 0) return null;
        const owned = filtered.filter((card) => card.ownership !== null);
        const missing = filtered.filter((card) => card.ownership === null);

        return (
          <div key={page.collectionId} className="mb-8">
            <h2 className="mb-3 font-serif text-lg font-semibold text-ink">{page.collectionName}</h2>

            {owned.length > 0 ? (
              <div
                className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5"
                style={LAZY_SECTION_STYLE}
              >
                {owned.map((card) => (
                  <CatalogTile key={card.id} card={card} onSelect={setSelectedCard} />
                ))}
              </div>
            ) : null}

            {missing.length > 0 ? (
              <>
                <h3 className="mt-5 mb-2 text-xs font-semibold tracking-wide text-ink-faint uppercase">
                  {t("catalog.missingCards")}
                </h3>
                <div
                  className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5"
                  style={LAZY_SECTION_STYLE}
                >
                  {missing.map((card) => (
                    <CatalogTile key={card.id} card={card} onSelect={setSelectedCard} />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        );
      })}

      <div ref={sentinelRef} aria-hidden="true" className="h-1" />

      <CardDetailModal
        card={selectedCard}
        onOpenChange={(open) => {
          if (!open) setSelectedCard(null);
        }}
      />
    </div>
  );
}

function CatalogTile({
  card,
  onSelect,
}: {
  card: InventoryCardResponseDto;
  onSelect: (card: InventoryCardResponseDto) => void;
}) {
  return (
    <button type="button" onClick={() => onSelect(card)} className="text-left">
      <div className="relative">
        <CardArt
          name={card.name}
          imageUrl={card.imageUrl}
          rarity={card.rarity}
          cardType={card.type}
          locked={card.ownership === null}
          wear={
            card.ownership
              ? { floatValue: card.ownership.bestFloatValue, seed: Number(card.ownership.bestGeneratedCardId) }
              : undefined
          }
        />
        {card.ownership && card.ownership.count > 1 ? (
          <span
            className="absolute right-1 bottom-1 rounded-sm border border-hairline bg-ground px-1 py-0.5 font-mono text-[9px] font-bold"
            style={{ color: RARITY_ACCENT[card.rarity] }}
          >
            ×{card.ownership.count}
          </span>
        ) : null}
      </div>
      {card.ownership === null ? (
        // Locked cards render an empty, label-less case — this is the only
        // place their name is visible to a sighted user. An owned card
        // already carries its name on the slab's own label.
        <p className="mt-1 truncate text-xs text-ink-dim">{card.name}</p>
      ) : null}
    </button>
  );
}
