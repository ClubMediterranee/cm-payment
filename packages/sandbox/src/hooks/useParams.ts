import { useSearch } from "wouter";

export const useParams = () => {
  const search = useSearch();
  return new URLSearchParams(search);
};
