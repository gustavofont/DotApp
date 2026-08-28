import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dotCardClient } from "../../api/client";
import { Button } from "../../components/ui/button";
import { errorMessage } from "../../shared/apiError";

export function Friends() {
  const queryClient = useQueryClient();
  const [friendCode, setFriendCode] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

  const friendsQuery = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const { data, error } = await dotCardClient.GET("/friends");
      if (error) throw error;
      return data;
    },
  });

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data, error } = await dotCardClient.GET("/me");
      if (error) throw error;
      return data;
    },
  });

  function invalidateFriends() {
    void queryClient.invalidateQueries({ queryKey: ["friends"] });
  }

  const inviteMutation = useMutation({
    mutationFn: async (code: string) => {
      const { error } = await dotCardClient.POST("/friends/invites", {
        body: { friendCode: code },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setFriendCode("");
      setInviteError(null);
      invalidateFriends();
    },
    onError: (error) => {
      setInviteError(errorMessage(error, "Não foi possível enviar o convite."));
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await dotCardClient.POST("/friends/invites/{id}/accept", {
        params: { path: { id: userId } },
      });
      if (error) throw error;
    },
    onSuccess: invalidateFriends,
  });

  const declineMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await dotCardClient.DELETE("/friends/invites/{id}", {
        params: { path: { id: userId } },
      });
      if (error) throw error;
    },
    onSuccess: invalidateFriends,
  });

  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await dotCardClient.DELETE("/friends/{userId}", {
        params: { path: { userId } },
      });
      if (error) throw error;
    },
    onSuccess: invalidateFriends,
  });

  const rotateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await dotCardClient.POST("/me/friend-code/rotate");
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["me"] }),
  });

  function handleInviteSubmit(event: FormEvent) {
    event.preventDefault();
    if (!friendCode.trim()) return;
    inviteMutation.mutate(friendCode.trim().toUpperCase());
  }

  const friends = friendsQuery.data?.friends ?? [];
  const incoming = friendsQuery.data?.pendingInvites.filter((i) => i.direction === "incoming") ?? [];
  const outgoing = friendsQuery.data?.pendingInvites.filter((i) => i.direction === "outgoing") ?? [];

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 font-serif text-xl font-semibold text-ink">Amigos</h1>

      <div className="mb-6 rounded-2xl border border-hairline bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs tracking-wide text-ink-faint uppercase">Seu código</p>
            <p className="font-serif text-lg text-ink">{meQuery.data?.friendCode ?? "…"}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={rotateMutation.isPending}
            onClick={() => rotateMutation.mutate()}
          >
            {rotateMutation.isPending ? "Girando…" : "Rotacionar"}
          </Button>
        </div>

        <form onSubmit={handleInviteSubmit} className="flex gap-2">
          <input
            aria-label="Código de amigo"
            placeholder="K7X4M2QP"
            value={friendCode}
            onChange={(event) => setFriendCode(event.target.value.toUpperCase())}
            maxLength={8}
            className="w-full rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-sm tracking-widest text-ink uppercase outline-none focus-visible:border-legendary"
          />
          <Button type="submit" disabled={inviteMutation.isPending || !friendCode.trim()}>
            Convidar
          </Button>
        </form>
        {inviteError ? <p className="mt-2 text-sm text-destructive">{inviteError}</p> : null}
      </div>

      {friendsQuery.isLoading ? <p className="text-ink-dim">Carregando…</p> : null}
      {friendsQuery.error ? (
        <p className="text-destructive">Não foi possível carregar seus amigos.</p>
      ) : null}

      {incoming.length > 0 ? (
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-ink-faint uppercase">
            Convites recebidos
          </h2>
          <div className="flex flex-col gap-2">
            {incoming.map((invite) => (
              <div
                key={invite.userId}
                className="flex items-center justify-between rounded-lg border border-hairline bg-surface px-3 py-2"
              >
                <span className="text-sm text-ink">{invite.displayName}</span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={acceptMutation.isPending}
                    onClick={() => acceptMutation.mutate(invite.userId)}
                  >
                    Aceitar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={declineMutation.isPending}
                    onClick={() => declineMutation.mutate(invite.userId)}
                  >
                    Recusar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {outgoing.length > 0 ? (
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-ink-faint uppercase">
            Convites enviados
          </h2>
          <div className="flex flex-col gap-2">
            {outgoing.map((invite) => (
              <div
                key={invite.userId}
                className="flex items-center justify-between rounded-lg border border-hairline bg-surface px-3 py-2"
              >
                <span className="text-sm text-ink-dim">{invite.displayName}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={declineMutation.isPending}
                  onClick={() => declineMutation.mutate(invite.userId)}
                >
                  Cancelar
                </Button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-wide text-ink-faint uppercase">
          Seus amigos
        </h2>
        {friendsQuery.data && friends.length === 0 ? (
          <p className="text-sm text-ink-faint">Nenhum amigo ainda — convide alguém acima.</p>
        ) : null}
        <div className="flex flex-col gap-2">
          {friends.map((friend) => (
            <div
              key={friend.userId}
              className="flex items-center justify-between rounded-lg border border-hairline bg-surface px-3 py-2"
            >
              <span className="text-sm text-ink">{friend.displayName}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={removeMutation.isPending}
                onClick={() => removeMutation.mutate(friend.userId)}
              >
                Desfazer
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
