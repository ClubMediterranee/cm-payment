const isObject = (item: any): item is Record<string, any> => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

export const deepMerge = <T extends Record<string, any>, U extends Record<string, any>>(
  target: T,
  source: U,
): T & U => {
  const output = { ...target } as T & U;

  for (const key in source) {
    if (isObject(source[key])) {
      if (key in target && isObject(target[key])) {
        output[key] = deepMerge(target[key], source[key]) as any;
      } else {
        output[key] = source[key] as any;
      }
    } else {
      output[key] = source[key] as any;
    }
  }

  return output;
};
