import type { DeepPartial } from '../types/Content';

const isObject = (item: unknown): item is Record<string, unknown> =>
  item !== null && typeof item === 'object' && !Array.isArray(item);

export const mergeFromPattern = <T extends Record<string, unknown>>(
  pattern: T,
  source?: DeepPartial<T>,
): T => {
  if (!source) return pattern;

  const result = { ...pattern };

  for (const key in source) {
    if (isObject(source[key]) !== isObject(pattern[key])) continue;

    result[key] = (
      isObject(source[key]) && isObject(pattern[key])
        ? mergeFromPattern(
            pattern[key] as Record<string, unknown>,
            source[key] as DeepPartial<Record<string, unknown>>,
          )
        : typeof source[key] === typeof pattern[key]
          ? source[key]
          : result[key]
    ) as T[Extract<keyof T, string>];
  }

  return result;
};
