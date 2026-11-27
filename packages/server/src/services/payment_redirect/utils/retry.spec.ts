import { afterEach, describe, expect, it, vi } from 'vitest';

import { retry } from './retry.js';

describe('retry', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the result on the first successful attempt without delay', async () => {
    const fn = vi.fn().mockResolvedValue('ok');

    await expect(retry(fn)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries until success, waiting between attempts', async () => {
    vi.useFakeTimers();
    const fn = vi.fn().mockRejectedValueOnce(new Error('nope')).mockResolvedValueOnce('ok');

    const promise = retry(fn, { attempts: 3, delay: 10 });
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws the last error after exhausting all attempts', async () => {
    vi.useFakeTimers();
    const fn = vi.fn().mockRejectedValue(new Error('boom'));

    const promise = retry(fn, { attempts: 2, delay: 10 }).catch((error) => error);
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual(new Error('boom'));
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws the last error once the wait budget is reached', async () => {
    vi.useFakeTimers();
    const fn = vi.fn().mockRejectedValue(new Error('boom'));
    const onBudgetReached = vi.fn();

    const promise = retry(fn, {
      attempts: 10,
      delay: 5000,
      budgetMs: 12000,
      onBudgetReached,
    }).catch((error) => error);
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual(new Error('boom'));
    // 0 s, 5 s, 10 s: a 4th call at 15 s would pass the 12 s budget.
    expect(fn).toHaveBeenCalledTimes(3);
    expect(onBudgetReached).toHaveBeenCalledWith({ attempts: 3, elapsedMs: 10000 });
  });
});
