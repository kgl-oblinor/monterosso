import "@testing-library/jest-dom/vitest";

// jsdom lacks ResizeObserver, which some Radix / input-otp components observe.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

// input-otp's password-manager badge probe calls this on a timer; jsdom lacks it.
if (typeof document !== "undefined" && !document.elementFromPoint) {
  document.elementFromPoint = () => null;
}
