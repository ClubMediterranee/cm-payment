import { getPaymentUrl } from './url';

describe('getPaymentUrl', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should build a booking url with the defaults', () => {
    const url = new URL(
      getPaymentUrl('staging', { issuerType: 'GM', bookingId: '123', locale: 'fr-FR' }),
    );

    expect(url.origin + url.pathname).toBe('https://staging.caps.api.clubmed/gm/booking/123');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      locale: 'fr-FR',
      callback_url: 'https://staging.caps.api.clubmed/gm/confirmation',
      back_url: window.location.href,
    });
  });

  it('should build a seller proposal url with every optional param', () => {
    const url = new URL(
      getPaymentUrl('production', {
        issuerType: 'GO',
        proposalId: '456',
        customerId: '789',
        locale: 'en-GB',
        callbackUrl: 'https://host/cb',
        callbackUrlSeller: 'https://host/seller',
        backUrl: 'https://host/back',
        extraParams: { action: 'deposit', embedded: '1', ignored: undefined },
      }),
    );

    expect(url.origin + url.pathname).toBe('https://caps.api.clubmed/go/proposal/456');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      locale: 'en-GB',
      customer_id: '789',
      callback_url: 'https://host/cb',
      callback_url_seller: 'https://host/seller',
      back_url: 'https://host/back',
      action: 'deposit',
      embedded: '1',
    });
  });

  it('should resolve the environment or an explicit url', () => {
    expect(getPaymentUrl('integration', { issuerType: 'GM', bookingId: '1' })).toMatch(
      /^https:\/\/integration\.caps\.api\.clubmed\/gm\/booking\/1\?/,
    );
    expect(
      getPaymentUrl('production', {
        issuerType: 'GM',
        bookingId: '1',
        url: 'http://localhost:8083/',
      }),
    ).toMatch(/^http:\/\/localhost:8083\/gm\/booking\/1\?/);
  });

  it('should prefer the booking id', () => {
    expect(
      getPaymentUrl('staging', { issuerType: 'GM', bookingId: '1', proposalId: '2' }),
    ).toContain('/gm/booking/1?');
  });

  it('should default the locale to the browser language', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE');

    const url = new URL(getPaymentUrl('staging', { issuerType: 'GM', bookingId: '1' }));

    expect(url.searchParams.get('locale')).toBe('de-DE');
  });

  it.each(['fr', ''])('should fall back to fr-FR when the browser language is "%s"', (language) => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue(language);

    const url = new URL(getPaymentUrl('staging', { issuerType: 'GM', bookingId: '1' }));

    expect(url.searchParams.get('locale')).toBe('fr-FR');
  });

  it('should throw when a seller flow has no customerId', () => {
    expect(() => getPaymentUrl('staging', { issuerType: 'PARTNERS', bookingId: '1' })).toThrow(
      'customerId is required for issuerType PARTNERS',
    );
  });

  it('should throw without booking nor proposal id', () => {
    expect(() => getPaymentUrl('staging', { issuerType: 'GM' })).toThrow(
      'Either proposalId or bookingId must be provided',
    );
  });

  it('should encode the id', () => {
    expect(getPaymentUrl('staging', { issuerType: 'GM', bookingId: 'a/b' })).toContain(
      '/gm/booking/a%2Fb?',
    );
  });
});
