import { Link } from "react-router-dom";
import { ArrowLeftRight, PackageOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dotCardClient } from "../../api/client";
import { Button } from "../../components/ui/button";
import { CardArt } from "../../shared/components/CardArt";
import { errorMessage } from "../../shared/apiError";
import { unwrap } from "../../shared/apiUnwrap";
import type { components } from "../../api/dotcard.types";

type GeneratedCardResponseDto = components["schemas"]["GeneratedCardResponseDto"];

// Shared by "Melhores cartas" and "Cartas mais raras" — same grid, same
// CardArt treatment, only the ranking that feeds `exemplars` differs.
function CardShowcase({ title, exemplars }: { title: string; exemplars: GeneratedCardResponseDto[] }) {
  if (exemplars.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="mb-2 text-xs font-semibold tracking-wide text-ink-faint uppercase">{title}</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {exemplars.map((exemplar) => (
          <CardArt
            key={exemplar.id}
            name={exemplar.card.name}
            imageUrl={exemplar.card.imageUrl}
            rarity={exemplar.card.rarity}
            cardType={exemplar.card.type}
            wear={{ floatValue: exemplar.floatValue, seed: Number(exemplar.id) }}
          />
        ))}
      </div>
    </div>
  );
}

export function Home() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // One request for the whole screen — profile plus best/rarest showcases,
  // already ranked and limited to 5 server-side (GET /me/cards used to be
  // fetched with limit:100 and sorted here, which silently truncated any
  // player with more than 100 generated_cards).
  const { data, isLoading, error } = useQuery({
    queryKey: ["me", "summary"],
    queryFn: () => unwrap(dotCardClient.GET("/me/summary")),
  });

  const claimMutation = useMutation({
    mutationFn: () => unwrap(dotCardClient.POST("/me/daily-reward/claim")),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["me", "summary"] }),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {isLoading ? <p className="text-ink-dim">{t("common.loading")}</p> : null}
      {error ? <p className="text-destructive">{t("home.profileError")}</p> : null}

      {data ? (
        <>
          <div className="rounded-2xl border border-hairline bg-surface p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="truncate font-serif text-xl font-semibold text-ink">
                  {data.displayName}
                </h1>
                <p className="mt-1 font-mono text-xs tracking-wide text-ink-faint uppercase">
                  {data.friendCode}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs tracking-wide text-ink-faint uppercase">{t("home.balance")}</p>
                <p className="font-serif text-2xl font-semibold text-ink">
                  {data.balance} <span className="text-sm font-sans text-ink-dim">DP</span>
                </p>
              </div>
            </div>

            <div className="border-t border-hairline pt-5">
              {data.dailyRewardAvailable ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={claimMutation.isPending}
                  onClick={() => claimMutation.mutate()}
                >
                  {claimMutation.isPending ? t("home.claiming") : t("home.claim")}
                </Button>
              ) : (
                <p className="text-center text-sm text-ink-faint">
                  {t("home.alreadyClaimed")}
                </p>
              )}
              {claimMutation.error ? (
                <p className="mt-2 text-center text-sm text-destructive">
                  {errorMessage(claimMutation.error, t("home.claimError"))}
                </p>
              ) : null}
            </div>
          </div>

          {/* The one primary action of the page — gold reserved for it
              alone (The Reserved Gold Rule), so the daily-reward button
              above stays outline instead. */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              to="/pull"
              className="flex flex-col items-center gap-2 rounded-lg bg-legendary p-5 text-center text-[#241a06] transition-opacity hover:opacity-90"
            >
              <PackageOpen className="h-6 w-6" />
              <span className="font-serif text-sm font-semibold">{t("home.openPack")}</span>
            </Link>
            <Link
              to="/trades"
              className="flex flex-col items-center gap-2 rounded-lg border border-hairline bg-surface p-5 text-center text-ink transition-colors hover:border-legendary/50"
            >
              <ArrowLeftRight className="h-6 w-6 text-ink-dim" />
              <span className="font-serif text-sm font-semibold">{t("home.trades")}</span>
            </Link>
          </div>

          <CardShowcase title={t("home.bestCards")} exemplars={data.bestCards} />
          <CardShowcase title={t("home.rarestCards")} exemplars={data.rarestCards} />
        </>
      ) : null}
    </div>
  );
}
