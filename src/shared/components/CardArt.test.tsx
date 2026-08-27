import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CardArt } from "./CardArt";

// Wear's scratch layers use a 0 0 100 140 viewBox (see cardWear.ts); the
// medallion's type icon uses 0 0 24 24 — distinguishing the two lets tests
// tell "no wear" apart from "wear present" even though the medallion's own
// <svg> is always in the DOM regardless of wear.
const WEAR_SVG_SELECTOR = 'svg[viewBox="0 0 100 140"]';

describe("CardArt", () => {
  it("renders a locked placeholder with no image when locked", () => {
    const { container } = render(
      <CardArt
        name="Village Squire"
        imageUrl="https://example.com/a.png"
        rarity="COMMON"
        cardType="CREATURE"
        locked
      />,
    );

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/village squire.*não obtida/i)).toBeInTheDocument();
  });

  it("renders the rarity/type medallion and the name banner", () => {
    render(
      <CardArt
        name="Elven Watchtower"
        imageUrl="https://example.com/tower.png"
        rarity="RARE"
        cardType="LAND"
      />,
    );

    // <img alt> gives the accessible name; the banner is separate visible text content.
    expect(screen.getByRole("img", { name: "Elven Watchtower" })).toBeVisible();
    expect(screen.getByText("Elven Watchtower")).toBeVisible();
  });

  it("renders plain art with no wear treatment when `wear` is omitted", () => {
    const { container } = render(
      <CardArt
        name="Village Squire"
        imageUrl="https://example.com/a.png"
        rarity="COMMON"
        cardType="CREATURE"
      />,
    );

    const img = screen.getByRole("img", { name: "Village Squire" });
    expect(img).toHaveAttribute("src", "https://example.com/a.png");
    expect(img).not.toHaveAttribute("style", expect.stringContaining("filter"));
    expect(container.querySelector(WEAR_SVG_SELECTOR)).not.toBeInTheDocument();
  });

  it("applies the wear filter and scratch overlay when `wear` is given", () => {
    const { container } = render(
      <CardArt
        name="Ancient Golden Dragon"
        imageUrl="https://example.com/dragon.png"
        rarity="LEGENDARY"
        cardType="CREATURE"
        wear={{ floatValue: 0.9, seed: 16 }}
      />,
    );

    const img = screen.getByRole("img", { name: "Ancient Golden Dragon" });
    expect(img.style.filter).toContain("saturate");
    expect(container.querySelector(WEAR_SVG_SELECTOR)).toBeInTheDocument();
  });

  it("hides the medallion and name banner in compact mode", () => {
    const { container } = render(
      <CardArt
        name="Golden Plains"
        imageUrl="https://example.com/plains.png"
        rarity="COMMON"
        cardType="LAND"
        compact
      />,
    );

    // The <img alt> still carries the name, but no banner text content duplicates it.
    expect(screen.getByRole("img", { name: "Golden Plains" })).toBeVisible();
    expect(screen.queryByText("Golden Plains")).not.toBeInTheDocument();
    // No 24x24 icon viewBox anywhere — the medallion's TypeIcon never renders.
    expect(container.querySelector('svg[viewBox="0 0 24 24"]')).not.toBeInTheDocument();
  });

  it("falls back to the card name when there is no image at all", () => {
    render(
      <CardArt name="Wandering Skeleton" imageUrl={null} rarity="COMMON" cardType="CREATURE" />,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Wandering Skeleton")).toBeInTheDocument();
  });
});
