export const DIRECTUS_COLLECTIONS = {
  CONFIGURATIONS: 'caps_configurations',
  PROVIDERS: 'caps_providers',
} as const;

export const DIRECTUS_CONFIGURATION_FIELDS = [
  'key',
  'type',
  'value',
  'description',
  'overrides',
] as const;

export const DIRECTUS_SYSTEM_FIELDS = [
  'id',
  'sort',
  'user_created',
  'date_created',
  'user_updated',
  'date_updated',
  'provider_id',
] as const;

export const GLOBAL_LOCALE = '*';
export const PUBLISHED_STATUS = 'published';
