import { RETRY_DEFAULTS } from './constants.js';
import { startWaitBudget, type WaitBudgetOptions } from './waitBudget.js';

type RetryOptions = WaitBudgetOptions & {
  attempts?: number;
  delay?: number;
};

/** Retries `fn` on error; the last error is thrown once the attempts or the wait budget are exhausted. */
export const retry = async <T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> => {
  const { attempts = RETRY_DEFAULTS.attempts, delay = RETRY_DEFAULTS.delay } = options;
  const wait = startWaitBudget(delay, options);

  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= attempts || !(await wait(attempt))) throw error;
    }
  }
};
