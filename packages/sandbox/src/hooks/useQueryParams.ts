import {useSearchParams} from "wouter";

export function useQueryParams<T = Record<string, unknown>>(): T {
  const [searchParams] = useSearchParams()

  return Object.fromEntries(searchParams) as T;
}