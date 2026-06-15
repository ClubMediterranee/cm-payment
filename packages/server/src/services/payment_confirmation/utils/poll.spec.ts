import { poll } from './poll.js';

describe('poll', () => {
  it('should return result when continue condition becomes false', async () => {
    let attempt = 0;
    const fn = vi.fn(async () => {
      attempt++;
      return { status: attempt === 2 ? 'SUCCESS' : 'PENDING' };
    });

    const result = await poll(fn, {
      attempts: 5,
      delay: 10,
      continue: (res) => res.status === 'PENDING',
    });

    expect(result).toEqual({ status: 'SUCCESS' });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should return the last result after max attempts', async () => {
    const fn = vi.fn(async () => ({ status: 'PENDING' }));

    const result = await poll(fn, {
      attempts: 3,
      delay: 10,
      continue: (res) => res.status === 'PENDING',
    });

    expect(result).toEqual({ status: 'PENDING' });
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should wait specified delay between attempts', async () => {
    const startTime = Date.now();
    const fn = vi.fn(async () => ({ status: 'PENDING' }));

    await poll(fn, {
      attempts: 3,
      delay: 100,
      continue: (res) => res.status === 'PENDING',
    });

    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeGreaterThanOrEqual(200);
  });

  it('should use default values for attempts and delay', async () => {
    const fn = vi.fn(async () => ({ status: 'PENDING' }));

    await poll(fn, {
      continue: (res) => res.status === 'PENDING',
    });

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should infer correct return type', async () => {
    type CustomResponse = { data: string; code: number };

    const fn = async (): Promise<CustomResponse> => ({
      data: 'test',
      code: 200,
    });

    const result = await poll(fn, {
      continue: (res) => res.code !== 200,
    });

    expect(result.data).toBe('test');
    expect(result.code).toBe(200);
  });

  it('should return immediately if first attempt satisfies condition', async () => {
    const fn = vi.fn(async () => ({ status: 'SUCCESS' }));

    const result = await poll(fn, {
      attempts: 5,
      delay: 100,
      continue: (res) => res.status === 'PENDING',
    });

    expect(result).toEqual({ status: 'SUCCESS' });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
