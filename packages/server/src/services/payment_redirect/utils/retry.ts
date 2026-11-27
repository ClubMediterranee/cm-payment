import { RETRY_DEFAULTS, WAIT_BUDGET_MS } from './constants.js';

type RetryOptions = {
  attempts?: number;
  delay?: number;
  /** Total waiting time allowed between attempts (`WAIT_BUDGET_MS` by default). */
  budgetMs?: number;
  /** Called when the budget stops the retries: the last error is then thrown. */
  onBudgetReached?: (info: { attempts: number; elapsedMs: number }) => void;
};

export const retry = async <T>(
  fn: () => Promise<T>,
  {
    attempts = RETRY_DEFAULTS.attempts,
    delay = RETRY_DEFAULTS.delay,
    budgetMs = WAIT_BUDGET_MS,
    onBudgetReached,
  }: RetryOptions = {},
): Promise<T> => {
  const startedAt = Date.now();

  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= attempts) throw error;

      const elapsedMs = Date.now() - startedAt;

      if (elapsedMs + delay > budgetMs) {
        onBudgetReached?.({ attempts: attempt, elapsedMs });
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
