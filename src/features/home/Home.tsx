import { useQuery } from "@tanstack/react-query";
import { dotCardClient } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";

export function Home() {
  const { logout } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data, error } = await dotCardClient.GET("/me");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <span className="font-serif text-xl font-semibold text-ink">DotCard</span>
        <button
          onClick={() => void logout()}
          className="text-sm text-ink-faint hover:text-ink"
        >
          Sair
        </button>
      </div>

      {isLoading ? <p className="text-ink-dim">Carregando…</p> : null}
      {error ? <p className="text-destructive">Não foi possível carregar seu perfil.</p> : null}

      {data ? (
        <div className="rounded-2xl border border-hairline bg-surface p-5">
          <div className="mb-4 flex items-center justify-between border-b border-hairline pb-4">
            <span className="text-xs tracking-wide text-ink-faint uppercase">Saldo</span>
            <span className="font-serif text-2xl font-semibold text-legendary-soft">
              {data.balance} <span className="text-sm font-sans text-ink-dim">DotPoints</span>
            </span>
          </div>
          <div className="flex justify-between py-1 text-sm text-ink-dim">
            <span>Nome</span>
            <span className="text-ink">{data.displayName}</span>
          </div>
          <div className="flex justify-between py-1 text-sm text-ink-dim">
            <span>Código de amigo</span>
            <span className="text-ink">{data.friendCode}</span>
          </div>
          <div className="flex justify-between py-1 text-sm text-ink-dim">
            <span>Resgate diário</span>
            <span className="text-ink">
              {data.dailyRewardAvailable ? "Disponível" : "Já resgatado hoje"}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
