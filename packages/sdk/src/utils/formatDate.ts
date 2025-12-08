const API_DATE_REGEX = /^[0-9]{8}$/;

export const parseApiDate = (apiDate?: string | null) => {
  if (!apiDate || !API_DATE_REGEX.test(apiDate)) return null;
  const y = +apiDate.slice(0, 4);
  const m = +apiDate.slice(4, 6);
  const d = +apiDate.slice(6, 8);
  const date = new Date(y, m - 1, d);

  const isMatchingDate =
    date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;

  if (!isMatchingDate) {
    return null;
  }
  return date;
};

export const formatDate = (apiDate?: string | null, options: Intl.DateTimeFormatOptions = {}) => {
  const date = parseApiDate(apiDate);

  if (!date) return '';

  return new Intl.DateTimeFormat('fr-FR', options).format(date);
};

export const daysUntilToday = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const diffMs = d.getTime() - today.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};
