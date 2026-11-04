import { OidcIssuerTypes } from '../../../types/CapsSettings';
import { paymentConfigQueryOptions } from './index';

const config = {
  locale: 'fr-FR',
  oidc: { accessToken: 'token', issuerType: OidcIssuerTypes.GM },
  api: { url: 'https://caps.example', apiKey: 'api-key' },
};

describe('paymentConfigQueryOptions', () => {
  it('scopes the cache key by API url, locale and issuer', () => {
    expect(paymentConfigQueryOptions(config).queryKey).toEqual([
      'paymentConfig',
      'https://caps.example',
      'fr-FR',
      'GM',
    ]);
  });
});
