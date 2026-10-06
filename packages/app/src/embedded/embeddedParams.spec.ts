import { getTokenSubject, normalizeOrigin, readEmbeddedParams } from './embeddedParams';

const STORAGE_KEY = 'caps.embedded';

describe('normalizeOrigin', () => {
  it('keeps a bare origin', () => {
    expect(normalizeOrigin('https://host.example')).toBe('https://host.example');
    expect(normalizeOrigin('https://host.example:8443/')).toBe('https://host.example:8443');
  });

  it.each([
    null,
    undefined,
    '',
    'not a url',
    'https://host.example/path',
    'https://host.example/?a=1',
    'https://host.example/#hash',
  ])('rejects %s', (value) => {
    expect(normalizeOrigin(value)).toBeNull();
  });
});

describe('readEmbeddedParams', () => {
  let top: PropertyDescriptor | undefined;

  const frame = () => Object.defineProperty(window, 'top', { value: {}, configurable: true });

  beforeEach(() => {
    top = Object.getOwnPropertyDescriptor(window, 'top');
    sessionStorage.clear();
  });

  afterEach(() => {
    if (top) {
      Object.defineProperty(window, 'top', top);
    }
  });

  it('is not embedded outside an iframe', () => {
    expect(readEmbeddedParams('?embedded=1&parent_origin=https://host.example')).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('is embedded when the top window cannot be read (cross-origin frame)', () => {
    Object.defineProperty(window, 'top', {
      configurable: true,
      get() {
        throw new Error('cross-origin');
      },
    });

    expect(readEmbeddedParams('?embedded=1&parent_origin=https://host.example')).toEqual({
      parentOrigin: 'https://host.example',
    });
  });

  it('reads the parent origin from the url and stores it', () => {
    frame();

    expect(readEmbeddedParams('?embedded=1&parent_origin=https://host.example')).toEqual({
      parentOrigin: 'https://host.example',
    });
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY)!)).toEqual({
      parentOrigin: 'https://host.example',
    });
  });

  it('rejects an invalid parent origin', () => {
    frame();

    expect(readEmbeddedParams('?embedded=1&parent_origin=https://host.example/path')).toEqual({
      parentOrigin: null,
    });
  });

  it('restores the embedded mode after an internal navigation', () => {
    frame();
    readEmbeddedParams('?embedded=1&parent_origin=https://host.example');

    expect(readEmbeddedParams('?locale=fr-FR')).toEqual({ parentOrigin: 'https://host.example' });
  });

  it('is not embedded in a frame without embedded params', () => {
    frame();

    expect(readEmbeddedParams('')).toBeNull();
  });

  it('ignores a corrupted storage', () => {
    frame();
    sessionStorage.setItem(STORAGE_KEY, '{not json');

    expect(readEmbeddedParams('')).toBeNull();
  });
});

describe('getTokenSubject', () => {
  const token = (payload: object) =>
    `x.${btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}.y`;

  it('returns the sub claim', () => {
    expect(getTokenSubject(token({ sub: 'customer-42' }))).toBe('customer-42');
  });

  it('returns undefined for a missing or malformed token', () => {
    expect(getTokenSubject()).toBeUndefined();
    expect(getTokenSubject('not-a-jwt')).toBeUndefined();
  });
});
