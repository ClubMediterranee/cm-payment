export const retry = async <T>(
  fn: () => Promise<T>,
  { attempts = 10, delay = 1000 }: { attempts?: number; delay?: number } = {},
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
