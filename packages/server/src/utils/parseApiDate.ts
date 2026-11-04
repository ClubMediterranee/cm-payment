const API_DATE_REGEX = /^[0-9]{8}$/;

export const parseApiDate = (apiDate?: string | null): Date | null => {
  if (!apiDate || !API_DATE_REGEX.test(apiDate)) return null;
  const y = +apiDate.slice(0, 4);
  const m = +apiDate.slice(4, 6);
  const d = +apiDate.slice(6, 8);
  const date = new Date(y, m - 1, d);
  const isMatchingDate =
    date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  return isMatchingDate ? date : null;
};
