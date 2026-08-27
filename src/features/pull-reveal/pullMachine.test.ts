import { createActor, waitFor } from "xstate";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { pullMachine, type GeneratedCard } from "./pullMachine";
import { dotCardClient } from "../../api/client";

vi.mock("../../api/client", () => ({
  dotCardClient: { POST: vi.fn() },
}));

const mockedPost = vi.mocked(dotCardClient.POST);

function makeCard(overrides: Partial<GeneratedCard> = {}): GeneratedCard {
  return {
    id: "1",
    floatValue: 0.5,
    pullId: "pull-1",
    createdAt: new Date().toISOString(),
    card: {
      id: 1,
      name: "Village Squire",
      type: "CREATURE",
      rarity: "COMMON",
      collectionId: 1,
      imageUrl: "https://example.com/a.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    ...overrides,
  };
}

beforeEach(() => {
  mockedPost.mockReset();
});

describe("pullMachine", () => {
  it("moves to opening on OPEN, then to revealing once the pull resolves", async () => {
    const cards = [makeCard()];
    mockedPost.mockResolvedValue({ data: cards, error: undefined, response: { status: 201 } } as never);

    const actor = createActor(pullMachine).start();
    actor.send({ type: "OPEN", collectionId: 1, size: 1 });
    expect(actor.getSnapshot().value).toBe("opening");

    await waitFor(actor, (snapshot) => snapshot.matches("revealing"));
    expect(actor.getSnapshot().context.cards).toEqual(cards);
    expect(actor.getSnapshot().context.currentIndex).toBe(0);
  });

  it("advances through REVEAL_NEXT and reaches done after the last card", async () => {
    const cards = [makeCard({ id: "1" }), makeCard({ id: "2" }), makeCard({ id: "3" })];
    mockedPost.mockResolvedValue({ data: cards, error: undefined, response: { status: 201 } } as never);

    const actor = createActor(pullMachine).start();
    actor.send({ type: "OPEN", collectionId: 1, size: 5 });
    await waitFor(actor, (snapshot) => snapshot.matches("revealing"));

    actor.send({ type: "REVEAL_NEXT" });
    expect(actor.getSnapshot().context.currentIndex).toBe(1);

    actor.send({ type: "REVEAL_NEXT" });
    expect(actor.getSnapshot().context.currentIndex).toBe(2);

    actor.send({ type: "REVEAL_NEXT" });
    expect(actor.getSnapshot().value).toBe("done");
  });

  it("goes to error with insufficient_balance on a 402, and RESET returns to a clean idle", async () => {
    mockedPost.mockResolvedValue({
      data: undefined,
      error: { message: "Insufficient balance" },
      response: { status: 402 },
    } as never);

    const actor = createActor(pullMachine).start();
    actor.send({ type: "OPEN", collectionId: 1, size: 1 });

    await waitFor(actor, (snapshot) => snapshot.matches("error"));
    expect(actor.getSnapshot().context.error).toBe("insufficient_balance");

    actor.send({ type: "RESET" });
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe("idle");
    expect(snapshot.context.error).toBeNull();
  });
});
