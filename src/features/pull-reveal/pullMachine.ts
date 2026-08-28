import { setup, assign, fromPromise } from "xstate";
import { dotCardClient } from "../../api/client";
import type { components } from "../../api/dotcard.types";

export type GeneratedCard = components["schemas"]["GeneratedCardResponseDto"];
export type PackSize = 1 | 5 | 10;

interface PullContext {
  collectionId: number;
  size: PackSize;
  cards: GeneratedCard[];
  currentIndex: number;
  error: "insufficient_balance" | "generic" | null;
}

type PullEvent =
  | { type: "OPEN"; collectionId: number; size: PackSize }
  | { type: "REVEAL_NEXT" }
  | { type: "RESET" };

// The opening animation needs room to play — on a fast local backend the
// real request resolves in tens of ms, which would cut it off before it
// reads as an animation at all. Errors skip this floor entirely, so a
// failure surfaces immediately instead of being held for no reason.
const MIN_OPENING_MS = 1100;

async function openPack({
  input,
}: {
  input: { collectionId: number; size: PackSize };
}): Promise<GeneratedCard[]> {
  const startedAt = Date.now();
  const { data, error, response } = await dotCardClient.POST("/collections/{id}/pulls", {
    params: { path: { id: input.collectionId } },
    body: { size: input.size },
  });
  if (error) {
    throw new Error(response.status === 402 ? "insufficient_balance" : "generic");
  }

  const remaining = MIN_OPENING_MS - (Date.now() - startedAt);
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
  return data;
}

export const pullMachine = setup({
  types: {
    context: {} as PullContext,
    events: {} as PullEvent,
  },
  actors: {
    openPack: fromPromise(openPack),
  },
}).createMachine({
  id: "pull",
  initial: "idle",
  context: {
    collectionId: 0,
    size: 5,
    cards: [],
    currentIndex: 0,
    error: null,
  },
  states: {
    idle: {
      on: {
        OPEN: {
          target: "opening",
          actions: assign({
            collectionId: ({ event }) => event.collectionId,
            size: ({ event }) => event.size,
            error: null,
          }),
        },
      },
    },
    opening: {
      invoke: {
        src: "openPack",
        input: ({ context }) => ({ collectionId: context.collectionId, size: context.size }),
        onDone: {
          target: "revealing",
          actions: assign({
            cards: ({ event }) => event.output,
            currentIndex: 0,
          }),
        },
        onError: {
          target: "error",
          actions: assign({
            error: ({ event }) =>
              event.error instanceof Error && event.error.message === "insufficient_balance"
                ? "insufficient_balance"
                : "generic",
          }),
        },
      },
    },
    revealing: {
      on: {
        REVEAL_NEXT: [
          {
            guard: ({ context }) => context.currentIndex < context.cards.length - 1,
            actions: assign({
              currentIndex: ({ context }) => context.currentIndex + 1,
            }),
          },
          { target: "done" },
        ],
      },
    },
    done: {
      on: {
        RESET: {
          target: "idle",
          actions: assign({ cards: [], currentIndex: 0, error: null }),
        },
      },
    },
    error: {
      on: {
        RESET: {
          target: "idle",
          actions: assign({ error: null }),
        },
      },
    },
  },
});
