export interface FeatureFlipItem {
  key: string;
  value: boolean;
}

export interface FeatureFlipsResponse {
  keys: FeatureFlipItem[];
}

export interface FeatureFlipsContextValue {
  flips: Record<string, boolean>;
  getFlip: (key: string) => boolean;
}
