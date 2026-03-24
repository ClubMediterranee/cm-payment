type PollOptions<T> = {
  attempts?: number;
  delay?: number;
  continue: (result: T) => boolean;
};

export const poll = async <T>(fn: () => Promise<T>, options: PollOptions<T>): Promise<T> => {
  const { attempts = 3, delay = 1000, continue: shouldContinue } = options;

  for (let i = 0; i < attempts; i++) {
    const result = await fn();

    if (!shouldContinue(result)) {
      return result;
    }

    if (i < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(`Polling timeout after ${attempts} attempts`);
};
