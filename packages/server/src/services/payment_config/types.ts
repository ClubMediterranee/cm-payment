export enum OidcIssuerTypes {
  GM = 'GM',
  GO = 'GO',
  PARTNERS = 'PARTNERS',
}

export type PaymentFeatureFlips = {
  is_paypal_button_enabled?: boolean;
};

export type PaymentConfigSettings = {
  days_before_trip_to_allow_free_deposit?: number | null;
};
