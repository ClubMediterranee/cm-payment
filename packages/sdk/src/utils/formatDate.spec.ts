import { daysUntilToday, formatDate, parseApiDate } from './formatDate';

describe('parseApiDate', () => {
  it('parses a valid yyyymmdd string into a Date', () => {
    const date = parseApiDate('20260615');
    expect(date).toBeInstanceOf(Date);
    expect(date!.getFullYear()).toBe(2026);
    expect(date!.getMonth()).toBe(5);
    expect(date!.getDate()).toBe(15);
  });

  it('returns null for nullish input', () => {
    expect(parseApiDate(undefined)).toBeNull();
    expect(parseApiDate(null)).toBeNull();
    expect(parseApiDate('')).toBeNull();
  });

  it('returns null when the string does not match the api date format', () => {
    expect(parseApiDate('2026-06-15')).toBeNull();
    expect(parseApiDate('06152026')).toBeNull();
  });

  it('returns null when the date is invalid (e.g. feb 30)', () => {
    expect(parseApiDate('20260230')).toBeNull();
  });
});

describe('formatDate', () => {
  it('formats a valid date with the provided options', () => {
    expect(formatDate('20260615', { year: 'numeric', month: '2-digit', day: '2-digit' })).toBe(
      '15/06/2026',
    );
  });

  it('returns an empty string for an unparseable date', () => {
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('not-a-date')).toBe('');
  });
});

describe('daysUntilToday', () => {
  it('returns 0 when the target date is today', () => {
    const today = new Date();
    expect(daysUntilToday(today)).toBe(0);
  });

  it('returns a positive number of days for future dates', () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    expect(daysUntilToday(future)).toBe(7);
  });

  it('returns a negative number for past dates', () => {
    const past = new Date();
    past.setDate(past.getDate() - 3);
    expect(daysUntilToday(past)).toBe(-3);
  });
});
