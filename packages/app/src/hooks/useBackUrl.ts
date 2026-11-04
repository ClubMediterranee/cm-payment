import { useSearch } from 'wouter';

export const useBackUrl = (): string => {
  const search = useSearch();

  return new URLSearchParams(search).get('back_url') || document.referrer;
};
