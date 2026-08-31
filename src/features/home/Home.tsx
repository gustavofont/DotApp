import { Link } from "react-router-dom";
import { ArrowLeftRight, PackageOpen } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dotCardClient } from "../../api/client";
import { Button } from "../../components/ui/button";
import { CardArt } from "../../shared/components/CardArt";
import { errorMessage } from "../../shared/apiError";

export function Home() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data, error } = await dotCardClient.GET("/me");
      if (error) throw error;
      return data;
    },
  });

  // A large-enough page to rank the *whole* collection by grade, not just
  // whatever page happened to load — "melhores cartas" means best overall.
  const myCardsQuery = useQuery({
    queryKey: ["me", "cards"],
    queryFn: async () => {
      const { data, error } = await dotCardClient.GET("/me/cards", { params: { query: { limit: 100 } } });
      if (error) throw error;
      return data;
    },
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      const { error } = await dotCardClient.POST("/me/daily-reward/claim");
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["me"] }),
  });

  // Lower float = better condition = higher grade — same convention as
  // CardArt's own GR label (shared/cardWear.ts).
  const bestCards = [...(myCardsQuery.data?.items ?? [])]
    .sort((a, b) => a.floatValue - b.floatValue)
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {isLoading ? <p className="text-ink-dim">Carregando…</p> : null}
      {error ? <p className="text-destructive">Não foi possível carregar seu perfil.</p> : null}

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
                <p className="text-xs tracking-wide text-ink-faint uppercase">Saldo</p>
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
                  {claimMutation.isPending ? "Resgatando…" : "Resgatar recompensa diária"}
                </Button>
              ) : (
                <p className="text-center text-sm text-ink-faint">
                  Recompensa diária já resgatada hoje
                </p>
              )}
              {claimMutation.error ? (
                <p className="mt-2 text-center text-sm text-destructive">
                  {errorMessage(claimMutation.error, "Não foi possível resgatar agora.")}
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
              <span className="font-serif text-sm font-semibold">Abrir Pacote</span>
            </Link>
            <Link
              to="/trades"
              className="flex flex-col items-center gap-2 rounded-lg border border-hairline bg-surface p-5 text-center text-ink transition-colors hover:border-legendary/50"
            >
              <ArrowLeftRight className="h-6 w-6 text-ink-dim" />
              <span className="font-serif text-sm font-semibold">Trocas</span>
            </Link>
          </div>

          {bestCards.length > 0 ? (
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold tracking-wide text-ink-faint uppercase">
                Melhores cartas
              </p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {bestCards.map((exemplar) => (
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
          ) : null}
        </>
      ) : null}
    </div>
  );
}
