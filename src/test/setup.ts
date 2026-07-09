import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

// next/image renders a plain <img> in tests; next-only props are stripped
// so jsdom doesn't warn about invalid DOM attributes.
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill, priority, ...rest } = props;
    void fill;
    void priority;
    return createElement("img", rest);
  },
}));

// jsdom lacks matchMedia (used by framer-motion's useReducedMotion).
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// jsdom lacks IntersectionObserver (used by framer-motion's whileInView).
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

// jsdom lacks Element.scrollBy (used by MovieRail chevrons).
Element.prototype.scrollBy = Element.prototype.scrollBy ?? (() => undefined);


const memoryStore = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => memoryStore.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memoryStore.set(key, String(value));
  },
  removeItem: (key: string) => {
    memoryStore.delete(key);
  },
  clear: () => {
    memoryStore.clear();
  },
  key: (index: number) => [...memoryStore.keys()][index] ?? null,
  get length() {
    return memoryStore.size;
  },
};
Object.defineProperty(window, "localStorage", {
  configurable: true,
  writable: true,
  value: localStorageMock,
});

vi.stubGlobal(
  "fetch",
  vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/api/title/")) {
      return {
        ok: true,
        json: async () => ({ title: null, seasons: [] }),
      } as Response;
    }
    if (url.includes("/api/catalog")) {
      return {
        ok: true,
        json: async () => ({
          titles: [],
          page: 1,
          totalPages: 1,
          totalResults: 0,
          liveCatalog: false,
        }),
      } as Response;
    }
    return { ok: false, json: async () => ({}) } as Response;
  }),
);
