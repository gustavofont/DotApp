import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// RTL's own auto-cleanup only registers itself when `afterEach` is a global,
// which it isn't here (no `globals: true` in vite.config.ts) — without this,
// DOM from one test leaks into the next within the same file.
afterEach(cleanup);
