import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

function createMediaQueryList(query: string): MediaQueryList {
  return {
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;
}

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  value: vi.fn().mockImplementation(createMediaQueryList),
  writable: true,
});
