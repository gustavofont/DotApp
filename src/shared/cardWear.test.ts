import { describe, expect, it } from "vitest";
import { getWearStyle } from "./cardWear";

describe("getWearStyle", () => {
  it("applies no visible wear at float 0 — pristine card", () => {
    const style = getWearStyle(0, 1);
    expect(style.filter).toBe("saturate(1) sepia(0) contrast(1) brightness(1)");
    expect(style.grainOpacity).toBe(0);
    expect(style.cornerOpacity).toBe(0);
    expect(style.scratchLayersMarkup).toBe("");
  });

  it("applies maximum wear at float 1 — battle-scarred", () => {
    const style = getWearStyle(1, 1);
    expect(style.filter).toBe("saturate(0.45) sepia(0.4) contrast(0.82) brightness(0.9)");
    expect(style.grainOpacity).toBeCloseTo(0.3);
    expect(style.cornerOpacity).toBeCloseTo(0.7);
    expect(style.scratchLayersMarkup).not.toBe("");
    expect(style.scratchLayersMarkup).toContain("<svg");
  });

  it("clamps out-of-range float values instead of producing invalid CSS", () => {
    const belowRange = getWearStyle(-0.5, 1);
    const aboveRange = getWearStyle(1.5, 1);
    expect(belowRange).toEqual(getWearStyle(0, 1));
    expect(aboveRange).toEqual(getWearStyle(1, 1));
  });

  it("is deterministic — same float and seed always draw the same scratches", () => {
    const a = getWearStyle(0.6, 42);
    const b = getWearStyle(0.6, 42);
    expect(a.scratchLayersMarkup).toBe(b.scratchLayersMarkup);
  });

  it("draws a different scratch pattern for a different seed at the same float", () => {
    const a = getWearStyle(0.6, 1);
    const b = getWearStyle(0.6, 2);
    expect(a.scratchLayersMarkup).not.toBe(b.scratchLayersMarkup);
  });

  it("wear increases monotonically with float", () => {
    const low = getWearStyle(0.2, 1);
    const high = getWearStyle(0.8, 1);
    expect(high.grainOpacity).toBeGreaterThan(low.grainOpacity);
    expect(high.cornerOpacity).toBeGreaterThan(low.cornerOpacity);
  });
});
