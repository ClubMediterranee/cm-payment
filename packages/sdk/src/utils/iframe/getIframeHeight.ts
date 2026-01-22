import { PspProviders } from '../../types/PspProviders';

const IFRAME_HEIGHTS: Partial<Record<PspProviders, number>> = {
  [PspProviders.EGLOBALCOLLECT]: 450,
  [PspProviders.EPAYGATE]: 1100,
};

const DEFAULT_IFRAME_HEIGHT = 910;

export const getIframeHeight = (providerId?: string): number => {
  if (!providerId) return DEFAULT_IFRAME_HEIGHT;
  return IFRAME_HEIGHTS[providerId as PspProviders] ?? DEFAULT_IFRAME_HEIGHT;
};
