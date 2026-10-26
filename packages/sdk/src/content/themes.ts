import type { CapsTheme } from '../embed/shared';
import type { Content } from '../types/Content';
import { mergeFromPattern } from '../utils/mergeFromPattern';
import { defaultContent } from './default';

export const DEFAULT_CAPS_THEME: CapsTheme = 'legacy';

const legacyContent: Content = mergeFromPattern(defaultContent, {
  paymentProviders: { heading: 'Which payment method would you like to use?' },
  paymentSchedule: { heading: 'Choose your payment schedule' },
  cgv: { heading: 'Terms and conditions' },
  freeDeposit: {
    totalRemaining: 'Total remaining to pay',
    before: 'before',
    payNowLabel: 'I pay now',
  },
});

export const contentByTheme: Record<CapsTheme, Content> = {
  current: defaultContent,
  legacy: legacyContent,
};
