import { RETRY_DEFAULTS } from './constants.js';
import { startWaitBudget, type WaitBudgetOptions } from './waitBudget.js';

type PollOptions<T> = WaitBudgetOptions & {
  attempts?: number;
  delay?: number;
  continue: (result: T) => boolean;
};

export const poll = async <T>(fn: () => Promise<T>, options: PollOptions<T>): Promise<T> => {
  const {
    attempts = RETRY_DEFAULTS.attempts,
    delay = RETRY_DEFAULTS.delay,
    continue: shouldContinue,
  } = options;
  const wait = startWaitBudget(delay, options);

  let result = await fn();

  for (let i = 1; i < attempts && shouldContinue(result); i++) {
    if (!(await wait(i))) break;

    result = await fn();
  }

  return result;
};
