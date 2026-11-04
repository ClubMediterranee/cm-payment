import { RETRY_DEFAULTS } from './constants.js';

export const retry = async <T>(
  fn: () => Promise<T>,
  {
    attempts = RETRY_DEFAULTS.attempts,
    delay = RETRY_DEFAULTS.delay,
  }: { attempts?: number; delay?: number } = {},
): Promise<T> => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
