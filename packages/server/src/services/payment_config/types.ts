export enum OidcIssuerTypes {
  GM = 'GM',
  GO = 'GO',
  PARTNERS = 'PARTNERS',
}

export const CAPS_THEMES = ['legacy', 'current'] as const;

export type CapsTheme = (typeof CAPS_THEMES)[number];

export const isCapsTheme = (value: unknown): value is CapsTheme =>
  CAPS_THEMES.includes(value as CapsTheme);

export type PaymentFeatureFlips = {
  is_paypal_button_enabled?: boolean;
  is_donation_enabled?: boolean;
  is_comments_enabled?: boolean;
};

export type PaymentConfigSettings = {
  theme?: CapsTheme;
  days_before_trip_to_allow_free_deposit?: number | null;
  payment_status_poll_attempts?: number;
  payment_status_poll_delay_ms?: number;
  dtmf_redirect_retry_attempts?: number;
  dtmf_redirect_retry_delay_ms?: number;
  max_amount_exceedance_type?: 'none' | 'percent' | 'amount' | null;
  max_amount_exceedance_value?: number | null;
};
