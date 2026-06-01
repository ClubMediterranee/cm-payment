export type ConfigValue = string | number | boolean | null;

export interface LocalizedItem {
  locale?: string;
}

export interface IssuerScopedItem extends LocalizedItem {
  issuer?: string;
}

export interface DirectusConfiguration {
  key: string;
  type: 'string' | 'number' | 'boolean';
  value: ConfigValue;
  overrides?: (IssuerScopedItem & { value: ConfigValue })[];
}

export interface DirectusProvider {
  id: string;
  default_display_type: 'hosted_field' | 'iframe' | 'redirect';
  settings: (LocalizedItem & {
    status?: string;
    settings: { key: string; value: unknown }[];
  })[];
}
