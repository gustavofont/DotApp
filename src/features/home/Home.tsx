import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dotCardClient } from "../../api/client";
import { Button } from "../../components/ui/button";
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

  const claimMutation = useMutation({
    mutationFn: async () => {
      const { error } = await dotCardClient.POST("/me/daily-reward/claim");
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["me"] }),
  });

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      {isLoading ? <p className="text-ink-dim">Carregando…</p> : null}
      {error ? <p className="text-destructive">Não foi possível carregar seu perfil.</p> : null}

      {data ? (
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
      ) : null}
    </div>
  );
}
