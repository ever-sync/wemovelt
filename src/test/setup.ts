import "@testing-library/jest-dom/vitest";

class MockIntersectionObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

class MockResizeObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver,
});

Object.defineProperty(window.navigator, "share", {
  writable: true,
  value: undefined,
});

Object.defineProperty(window.navigator, "clipboard", {
  writable: true,
  value: {
    writeText: vi.fn(),
  },
});

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: vi.fn(),
});
