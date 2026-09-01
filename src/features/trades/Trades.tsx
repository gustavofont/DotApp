import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMachine } from "@xstate/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dotCardClient } from "../../api/client";
import { getCurrentUserId } from "../../auth/tokenStore";
import { CardArt } from "../../shared/components/CardArt";
import { Button } from "../../components/ui/button";
import { unwrap } from "../../shared/apiUnwrap";
import { CardPicker } from "./CardPicker";
import { tradeMachine, type Trade } from "./tradeMachine";
import type { components } from "../../api/dotcard.types";

type GeneratedCardResponseDto = components["schemas"]["GeneratedCardResponseDto"];

function isActive(status: Trade["status"]): boolean {
  return status === "AWAITING_COUNTERPART" || status === "AWAITING_CONFIRMATION";
}

export function Trades() {
  const { t } = useTranslation();
  const myUserId = getCurrentUserId();
  const queryClient = useQueryClient();
  const [state, send] = useMachine(tradeMachine);
  const [creating, setCreating] = useState(false);
  const [toUserId, setToUserId] = useState("");

  const tradesQuery = useQuery({
    queryKey: ["trades"],
    queryFn: () => unwrap(dotCardClient.GET("/trades")),
    enabled: state.matches("idle"),
  });

  const friendsQuery = useQuery({
    queryKey: ["friends"],
    queryFn: () => unwrap(dotCardClient.GET("/friends")),
  });

  const myCardsQuery = useQuery({
    queryKey: ["me", "cards"],
    queryFn: () => unwrap(dotCardClient.GET("/me/cards", { params: { query: { limit: 100 } } })),
    enabled: creating || state.matches("open"),
  });

  const friendsById = new Map((friendsQuery.data?.friends ?? []).map((f) => [f.userId, f]));
  const myCards = myCardsQuery.data?.items ?? [];

  function closeDetail() {
    send({ type: "RESET" });
    void queryClient.invalidateQueries({ queryKey: ["trades"] });
    void queryClient.invalidateQueries({ queryKey: ["me", "cards"] });
  }

  // Trade detail — "versus" layout (offered card always left, requested
  // always right, regardless of which side the viewer is on).
  if (state.context.trade) {
    const trade = state.context.trade;
    const isProposer = trade.fromUser === myUserId;
    const isRecipient = trade.toUser === myUserId;
    const otherUserId = isProposer ? trade.toUser : trade.fromUser;
    const otherName = friendsById.get(otherUserId)?.displayName ?? t("trades.defaultPlayerName");
    const busy =
      state.matches("submittingCounterpart") ||
      state.matches("confirming") ||
      state.matches("cancelling");

    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <button
          type="button"
          onClick={closeDetail}
          className="mb-6 text-sm text-ink-dim hover:text-ink"
        >
          ← {t("common.back")}
        </button>

        <p className="mb-1 text-center text-xs tracking-wide text-ink-faint uppercase">
          {t("trades.tradeWith", { name: otherName })}
        </p>
        <p className="mb-6 text-center font-serif text-lg text-ink">
          {t(`trades.status.${trade.status}`)}
        </p>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <TradeCardSlot exemplar={trade.offeredCard} />
          {trade.requestedCard ? (
            <TradeCardSlot exemplar={trade.requestedCard} />
          ) : (
            <div className="flex aspect-[3/4.2] items-center justify-center rounded-2xl border border-dashed border-hairline text-center text-xs text-ink-faint">
              {t("trades.awaitingChoice")}
            </div>
          )}
        </div>

        {state.context.error ? (
          <p className="mb-4 text-center text-sm text-destructive">
            {t(`trades.errors.${state.context.error}`)}
          </p>
        ) : null}

        {trade.status === "AWAITING_COUNTERPART" && isRecipient ? (
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold tracking-wide text-ink-faint uppercase">
              {t("trades.chooseYourCard")}
            </p>
            <CardPicker
              cards={myCards}
              onSelect={(exemplar) => send({ type: "COUNTERPART", requestedCardId: exemplar.id })}
            />
          </div>
        ) : null}

        {trade.status === "AWAITING_CONFIRMATION" && isProposer ? (
          <Button
            type="button"
            className="mb-2 w-full"
            disabled={busy}
            onClick={() => send({ type: "CONFIRM" })}
          >
            {t("trades.confirm")}
          </Button>
        ) : null}

        {isActive(trade.status) && (isProposer || isRecipient) ? (
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            disabled={busy}
            onClick={() => send({ type: "CANCEL" })}
          >
            {t("trades.cancel")}
          </Button>
        ) : null}

        {!isActive(trade.status) ? (
          <Button type="button" variant="outline" className="w-full" onClick={closeDetail}>
            {t("trades.close")}
          </Button>
        ) : null}
      </div>
    );
  }

  // Create form.
  if (creating) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <button
          type="button"
          onClick={() => setCreating(false)}
          className="mb-6 text-sm text-ink-dim hover:text-ink"
        >
          ← {t("common.back")}
        </button>

        <h1 className="mb-6 font-serif text-xl font-semibold text-ink">{t("trades.new")}</h1>

        <label
          htmlFor="trade-friend"
          className="mb-1 block text-xs font-semibold tracking-wide text-ink-faint uppercase"
        >
          {t("trades.friend")}
        </label>
        <select
          id="trade-friend"
          value={toUserId}
          onChange={(event) => setToUserId(event.target.value)}
          className="mb-4 w-full rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-ink"
        >
          <option value="">{t("trades.chooseFriend")}</option>
          {(friendsQuery.data?.friends ?? []).map((friend) => (
            <option key={friend.userId} value={friend.userId}>
              {friend.displayName}
            </option>
          ))}
        </select>

        <p className="mb-2 text-xs font-semibold tracking-wide text-ink-faint uppercase">
          {t("trades.yourCard")}
        </p>
        {state.context.error ? (
          <p className="mb-2 text-sm text-destructive">
            {t(`trades.errors.${state.context.error}`)}
          </p>
        ) : null}
        <CardPicker
          cards={myCards}
          onSelect={(exemplar) => {
            if (!toUserId) return;
            setCreating(false);
            send({ type: "CREATE", toUserId, offeredCardId: exemplar.id });
          }}
        />
      </div>
    );
  }

  // List.
  const trades = tradesQuery.data ?? [];

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold text-ink">{t("trades.title")}</h1>
        <Button type="button" size="sm" onClick={() => setCreating(true)}>
          {t("trades.new")}
        </Button>
      </div>

      {tradesQuery.isLoading ? <p className="text-ink-dim">{t("common.loading")}</p> : null}
      {tradesQuery.error ? (
        <p className="text-destructive">{t("trades.loadError")}</p>
      ) : null}
      {tradesQuery.data && trades.length === 0 ? (
        <p className="text-sm text-ink-faint">{t("trades.empty")}</p>
      ) : null}

      <div className="flex flex-col gap-2">
        {trades.map((trade) => {
          const isProposer = trade.fromUser === myUserId;
          const otherUserId = isProposer ? trade.toUser : trade.fromUser;
          const otherName = friendsById.get(otherUserId)?.displayName ?? t("trades.defaultPlayerName");
          return (
            <button
              key={trade.id}
              type="button"
              onClick={() => send({ type: "LOAD", tradeId: trade.id })}
              className="flex items-center justify-between rounded-lg border border-hairline bg-surface px-3 py-2 text-left"
            >
              <div>
                <p className="text-sm text-ink">{otherName}</p>
                <p className="text-xs text-ink-faint">{trade.offeredCard.card.name}</p>
              </div>
              <span className="text-xs text-ink-dim">{t(`trades.status.${trade.status}`)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TradeCardSlot({ exemplar }: { exemplar: GeneratedCardResponseDto }) {
  return (
    <CardArt
      name={exemplar.card.name}
      imageUrl={exemplar.card.imageUrl}
      rarity={exemplar.card.rarity}
      cardType={exemplar.card.type}
      wear={{ floatValue: exemplar.floatValue, seed: Number(exemplar.id) }}
    />
  );
}
