import { getIframeHeight } from './getIframeHeight';

describe('getIframeHeight', () => {
  it('returns the registered height for EGLOBALCOLLECT', () => {
    expect(getIframeHeight('EGLOBALCOLLECT')).toBe(450);
  });

  it('returns the registered height for EPAYGATE', () => {
    expect(getIframeHeight('EPAYGATE')).toBe(1100);
  });

  it('returns the default height for unknown providers', () => {
    expect(getIframeHeight('UNKNOWN')).toBe(910);
  });

  it('returns the default height when no provider is given', () => {
    expect(getIframeHeight()).toBe(910);
    expect(getIframeHeight('')).toBe(910);
  });
});
