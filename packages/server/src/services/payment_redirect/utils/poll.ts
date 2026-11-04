import { RETRY_DEFAULTS } from './constants.js';

type PollOptions<T> = {
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

  let result = await fn();

  for (let i = 1; i < attempts && shouldContinue(result); i++) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    result = await fn();
  }

  return result;
};
