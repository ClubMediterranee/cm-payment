import { WAIT_BUDGET_MS } from './constants.js';

export type WaitBudgetOptions = {
  /** Total waiting time allowed between attempts (`WAIT_BUDGET_MS` by default). */
  budgetMs?: number;
  /** Called when the budget stops the attempts. */
  onBudgetReached?: (info: { attempts: number; elapsedMs: number }) => void;
};

/**
 * Starts the clock of a wait budget. The returned `wait(attempts)` sleeps `delay` and resolves `true`, or resolves
 * `false` (after calling `onBudgetReached`) when that sleep would exceed the budget.
 */
export const startWaitBudget = (
  delay: number,
  { budgetMs = WAIT_BUDGET_MS, onBudgetReached }: WaitBudgetOptions = {},
) => {
  const startedAt = Date.now();

  return async (attempts: number) => {
    const elapsedMs = Date.now() - startedAt;

    if (elapsedMs + delay > budgetMs) {
      onBudgetReached?.({ attempts, elapsedMs });

      return false;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));

    return true;
  };
};
