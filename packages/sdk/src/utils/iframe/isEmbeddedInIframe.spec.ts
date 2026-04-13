import { isEmbeddedInIframe } from './isEmbeddedInIframe';

describe('isEmbeddedInIframe', () => {
  it('should return false when not in iframe', () => {
    // GIVEN - window.self === window.top (default in tests)
    Object.defineProperty(window, 'self', {
      writable: true,
      value: window,
    });
    Object.defineProperty(window, 'top', {
      writable: true,
      value: window,
    });

    // WHEN
    const result = isEmbeddedInIframe();

    // THEN
    expect(result).toBe(false);
  });

  it('should return true when in iframe', () => {
    // GIVEN - window.self !== window.top
    Object.defineProperty(window, 'self', {
      writable: true,
      value: window,
    });
    Object.defineProperty(window, 'top', {
      writable: true,
      value: {},
    });

    // WHEN
    const result = isEmbeddedInIframe();

    // THEN
    expect(result).toBe(true);
  });
});
