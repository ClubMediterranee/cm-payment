export interface LegacyCmsFeatureFlipKey {
  key: string;
  value: boolean;
}

export interface LegacyCmsResponse {
  keys: Array<LegacyCmsFeatureFlipKey>;
  status_code?: number;
  error_description?: string;
  errors?: Array<{ error_description: string }>;
}
