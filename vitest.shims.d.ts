/// <reference types="@vitest/browser/providers/playwright" />

export {};

declare module 'jest-axe' {
  export function axe(element: any, options?: any): Promise<any>;
}

declare global {
  namespace Vitest {
    interface Matchers<R> {
      /**
       * Asserts that the element has no accessibility violations.
       * @param options - Options for the axe check.
       */
      toHaveNoViolations(options?: { detailed?: boolean }): R;
    }
  }
}

declare module 'vitest' {
  interface Assertion<T = any> {
    /**
     * Asserts that the element has no accessibility violations.
     * @param options - Options for the axe check.
     */
    toHaveNoViolations(options?: { detailed?: boolean }): T;
  }
}
