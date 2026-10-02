import type { CapsFlowParams } from './types';
import { buildCapsFlowUrl } from './url';

describe('buildCapsFlowUrl', () => {
  const baseUrl = 'https://caps.example';

  it('should build a booking flow url', () => {
    expect(
      buildCapsFlowUrl(baseUrl, {
        issuerType: 'GM',
        type: 'booking',
        id: '123',
        locale: 'fr-FR',
        callbackUrl: 'https://host/cb',
      }),
    ).toBe('https://caps.example/gm/booking/123?locale=fr-FR&callback_url=https%3A%2F%2Fhost%2Fcb');
  });

  it('should build a seller proposal flow url with every optional param', () => {
    const url = new URL(
      buildCapsFlowUrl(
        `${baseUrl}/`,
        {
          issuerType: 'GO',
          type: 'proposal',
          id: '456',
          customerId: '789',
          locale: 'en-GB',
          callbackUrl: 'https://host/cb',
          callbackUrlSeller: 'https://host/seller',
          action: 'deposit',
          reference: 'REF',
          uuid: 'abc',
        },
        { embedded: '1', parent_origin: 'https://host', ignored: undefined },
      ),
    );

    expect(url.pathname).toBe('/go/proposal/456');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      locale: 'en-GB',
      customer_id: '789',
      callback_url: 'https://host/cb',
      callback_url_seller: 'https://host/seller',
      action: 'deposit',
      reference: 'REF',
      uuid: 'abc',
      embedded: '1',
      parent_origin: 'https://host',
    });
  });

  it('should default the locale to the browser language', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE');

    const url = new URL(
      buildCapsFlowUrl(baseUrl, {
        issuerType: 'GM',
        type: 'booking',
        id: '1',
        callbackUrl: 'https://host/cb',
      }),
    );

    expect(url.searchParams.get('locale')).toBe('de-DE');
    vi.restoreAllMocks();
  });

  it('should fall back to fr-FR when the browser language has no region', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('fr');

    const url = new URL(
      buildCapsFlowUrl(baseUrl, {
        issuerType: 'GM',
        type: 'booking',
        id: '1',
        callbackUrl: 'https://host/cb',
      }),
    );

    expect(url.searchParams.get('locale')).toBe('fr-FR');
    vi.restoreAllMocks();
  });

  it('should fall back to fr-FR when the browser language is unavailable', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('');

    const url = new URL(
      buildCapsFlowUrl(baseUrl, {
        issuerType: 'GM',
        type: 'booking',
        id: '1',
        callbackUrl: 'https://host/cb',
      }),
    );

    expect(url.searchParams.get('locale')).toBe('fr-FR');
    vi.restoreAllMocks();
  });

  it('should throw when a seller flow has no customerId', () => {
    expect(() =>
      buildCapsFlowUrl(baseUrl, {
        issuerType: 'PARTNERS',
        type: 'booking',
        id: '1',
        callbackUrl: 'https://host/cb',
      } as unknown as CapsFlowParams),
    ).toThrow('customerId is required for issuerType PARTNERS');
  });

  it('should never put the access token in the url', () => {
    const props = {
      issuerType: 'GM' as const,
      type: 'booking' as const,
      id: '1',
      callbackUrl: 'https://host/cb',
      accessToken: 'secret-token',
    };

    expect(buildCapsFlowUrl(baseUrl, props)).not.toContain('secret-token');
  });

  it('should encode the id', () => {
    expect(
      buildCapsFlowUrl(baseUrl, {
        issuerType: 'GM',
        type: 'booking',
        id: 'a/b',
        locale: 'fr-FR',
        callbackUrl: 'https://host/cb',
      }),
    ).toContain('/gm/booking/a%2Fb?');
  });
});
