export const formatDate = (apiDate?: string | null, options: Intl.DateTimeFormatOptions = {}) => {
  if (!apiDate) return '';

  const year = apiDate.substring(0, 4);
  const month = apiDate.substring(4, 6);
  const day = apiDate.substring(6, 8);

  const date = new Date(`${year}-${month}-${day}`);

  return new Intl.DateTimeFormat('fr-FR', options).format(date);
};
