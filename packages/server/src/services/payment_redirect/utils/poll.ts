import { RETRY_DEFAULTS, WAIT_BUDGET_MS } from './constants.js';

type PollOptions<T> = {
  attempts?: number;
  delay?: number;
  continue: (result: T) => boolean;
  /** Total waiting time allowed between attempts (`WAIT_BUDGET_MS` by default). */
  budgetMs?: number;
  /** Called when the budget stops the polling while `continue` still asks for another attempt. */
  onBudgetReached?: (info: { attempts: number; elapsedMs: number }) => void;
};

export const poll = async <T>(fn: () => Promise<T>, options: PollOptions<T>): Promise<T> => {
  const {
    attempts = RETRY_DEFAULTS.attempts,
    delay = RETRY_DEFAULTS.delay,
    continue: shouldContinue,
    budgetMs = WAIT_BUDGET_MS,
    onBudgetReached,
  } = options;
  const startedAt = Date.now();

  let result = await fn();

  for (let i = 1; i < attempts && shouldContinue(result); i++) {
    const elapsedMs = Date.now() - startedAt;

    if (elapsedMs + delay > budgetMs) {
      onBudgetReached?.({ attempts: i, elapsedMs });
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    result = await fn();
  }

  return result;
};
