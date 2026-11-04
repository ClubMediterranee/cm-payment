import { isEmbeddedInIframe } from './isEmbeddedInIframe';

describe('isEmbeddedInIframe', () => {
  it('should return false when not in iframe', () => {
    Object.defineProperty(window, 'self', {
      writable: true,
      value: window,
    });
    Object.defineProperty(window, 'top', {
      writable: true,
      value: window,
    });

    const result = isEmbeddedInIframe();

    expect(result).toBe(false);
  });

  it('should return true when in iframe', () => {
    Object.defineProperty(window, 'self', {
      writable: true,
      value: window,
    });
    Object.defineProperty(window, 'top', {
      writable: true,
      value: {},
    });

    const result = isEmbeddedInIframe();

    expect(result).toBe(true);
  });
});
