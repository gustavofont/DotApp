import { setup, assign, fromPromise } from "xstate";
import { dotCardClient } from "../../api/client";
import type { components } from "../../api/dotcard.types";

export type Trade = components["schemas"]["TradeResponseDto"];

const POLL_INTERVAL_MS = 3000;

function isActive(trade: Trade): boolean {
  return trade.status === "AWAITING_COUNTERPART" || trade.status === "AWAITING_CONFIRMATION";
}

export type TradeErrorCode =
  | "loadFailed"
  | "createFailed"
  | "counterpartFailed"
  | "confirmFailed"
  | "cancelFailed";

interface TradeContext {
  trade: Trade | null;
  error: TradeErrorCode | null;
}

type TradeEvent =
  | { type: "LOAD"; tradeId: string }
  | { type: "CREATE"; toUserId: string; offeredCardId: string }
  | { type: "COUNTERPART"; requestedCardId: string }
  | { type: "CONFIRM" }
  | { type: "CANCEL" }
  | { type: "RESET" };

async function fetchTrade({ input }: { input: { tradeId: string } }): Promise<Trade> {
  const { data, error } = await dotCardClient.GET("/trades/{id}", {
    params: { path: { id: input.tradeId } },
  });
  if (error) throw error;
  return data;
}

async function createTrade({
  input,
}: {
  input: { toUserId: string; offeredCardId: string };
}): Promise<Trade> {
  const { data, error } = await dotCardClient.POST("/trades", {
    body: { toUserId: input.toUserId, offeredCardId: input.offeredCardId },
  });
  if (error) throw error;
  return data;
}

async function submitCounterpart({
  input,
}: {
  input: { tradeId: string; requestedCardId: string };
}): Promise<Trade> {
  const { data, error } = await dotCardClient.POST("/trades/{id}/counterpart", {
    params: { path: { id: input.tradeId } },
    body: { requestedCardId: input.requestedCardId },
  });
  if (error) throw error;
  return data;
}

async function confirmTrade({ input }: { input: { tradeId: string } }): Promise<Trade> {
  const { data, error } = await dotCardClient.POST("/trades/{id}/confirm", {
    params: { path: { id: input.tradeId } },
  });
  if (error) throw error;
  return data;
}

async function cancelTrade({ input }: { input: { tradeId: string } }): Promise<Trade> {
  const { data, error } = await dotCardClient.POST("/trades/{id}/cancel", {
    params: { path: { id: input.tradeId } },
  });
  if (error) throw error;
  return data;
}

export const tradeMachine = setup({
  types: {
    context: {} as TradeContext,
    events: {} as TradeEvent,
  },
  actors: {
    fetchTrade: fromPromise(fetchTrade),
    createTrade: fromPromise(createTrade),
    submitCounterpart: fromPromise(submitCounterpart),
    confirmTrade: fromPromise(confirmTrade),
    cancelTrade: fromPromise(cancelTrade),
  },
}).createMachine({
  id: "trade",
  initial: "idle",
  context: { trade: null, error: null },
  states: {
    idle: {
      on: {
        LOAD: { target: "loading", actions: assign({ error: null }) },
        CREATE: { target: "creatingTrade", actions: assign({ error: null }) },
      },
    },
    loading: {
      invoke: {
        src: "fetchTrade",
        input: ({ event }) => {
          if (event.type !== "LOAD") throw new Error("unreachable");
          return { tradeId: event.tradeId };
        },
        onDone: {
          target: "open",
          actions: assign({ trade: ({ event }) => event.output, error: null }),
        },
        onError: {
          target: "error",
          actions: assign({ error: "loadFailed" as const }),
        },
      },
    },
    creatingTrade: {
      invoke: {
        src: "createTrade",
        input: ({ event }) => {
          if (event.type !== "CREATE") throw new Error("unreachable");
          return { toUserId: event.toUserId, offeredCardId: event.offeredCardId };
        },
        onDone: {
          target: "open",
          actions: assign({ trade: ({ event }) => event.output, error: null }),
        },
        onError: {
          target: "error",
          actions: assign({ error: "createFailed" as const }),
        },
      },
    },
    // The "hub" state while a trade is open — polls the server every few
    // seconds so the other participant's actions (counterpart, confirm,
    // cancel) show up without the viewer refreshing the page.
    open: {
      after: {
        [POLL_INTERVAL_MS]: "polling",
      },
      on: {
        COUNTERPART: "submittingCounterpart",
        CONFIRM: "confirming",
        CANCEL: "cancelling",
      },
      always: {
        guard: ({ context }) => context.trade !== null && !isActive(context.trade),
        target: "resolved",
      },
    },
    polling: {
      invoke: {
        src: "fetchTrade",
        input: ({ context }) => ({ tradeId: context.trade!.id }),
        onDone: {
          target: "open",
          actions: assign({ trade: ({ event }) => event.output, error: null }),
        },
        // A transient poll failure shouldn't surface as an error banner —
        // just keep showing the last known state and retry next tick.
        onError: "open",
      },
    },
    submittingCounterpart: {
      invoke: {
        src: "submitCounterpart",
        input: ({ context, event }) => {
          if (event.type !== "COUNTERPART") throw new Error("unreachable");
          return { tradeId: context.trade!.id, requestedCardId: event.requestedCardId };
        },
        onDone: {
          target: "open",
          actions: assign({ trade: ({ event }) => event.output, error: null }),
        },
        onError: {
          target: "open",
          actions: assign({ error: "counterpartFailed" as const }),
        },
      },
    },
    confirming: {
      invoke: {
        src: "confirmTrade",
        input: ({ context }) => ({ tradeId: context.trade!.id }),
        onDone: {
          target: "open",
          actions: assign({ trade: ({ event }) => event.output, error: null }),
        },
        onError: {
          target: "open",
          actions: assign({ error: "confirmFailed" as const }),
        },
      },
    },
    cancelling: {
      invoke: {
        src: "cancelTrade",
        input: ({ context }) => ({ tradeId: context.trade!.id }),
        onDone: {
          target: "open",
          actions: assign({ trade: ({ event }) => event.output, error: null }),
        },
        onError: {
          target: "open",
          actions: assign({ error: "cancelFailed" as const }),
        },
      },
    },
    resolved: {
      on: {
        RESET: { target: "idle", actions: assign({ trade: null, error: null }) },
      },
    },
    error: {
      on: {
        RESET: { target: "idle", actions: assign({ trade: null, error: null }) },
      },
    },
  },
});
