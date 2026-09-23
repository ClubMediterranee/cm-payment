import { ActivationDayRange } from '../types.js';

export const mergeActivationDayRange = (
  base?: ActivationDayRange,
  override?: ActivationDayRange,
): ActivationDayRange | undefined => {
  if (!base) return override;
  if (!override) return base;

  return {
    min: Math.max(base.min, override.min),
    max:
      base.max == null && override.max == null
        ? null
        : Math.min(base.max ?? Infinity, override.max ?? Infinity),
  };
};
