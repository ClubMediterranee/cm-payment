import '@testing-library/jest-dom/vitest';

import { Globals } from '@react-spring/web';
import { cleanup } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeAll, vi } from 'vitest';

expect.extend(toHaveNoViolations);

beforeAll(() => {
  /**
   * Skip all animations from react spring to ease tests based on animated state transition
   */
  Globals.assign({
    skipAnimation: true,
  });
});

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
