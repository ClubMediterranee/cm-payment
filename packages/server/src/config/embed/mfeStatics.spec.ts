import { tmpdir } from 'node:os';

import { checkMfeRoot, getMfeCacheControl, setMfeCacheHeaders } from './mfeStatics.js';

describe('mfeStatics', () => {
  describe('getMfeCacheControl', () => {
    it.each([
      ['/dist/mf-manifest.json', 'no-cache'],
      ['/dist/remoteEntry.js', 'no-cache'],
      ['/dist/assets/index.html', 'no-cache'],
      ['/dist/assets/CapsForm-BqT3x9Zk.js', 'public, max-age=31536000, immutable'],
      ['/dist/assets/style-9f8e7d6c.css', 'public, max-age=31536000, immutable'],
      ['/dist/assets/font.a1b2c3d4e5.woff2', 'public, max-age=31536000, immutable'],
      ['/dist/assets/short-abc.js', 'no-cache'],
    ])('%s => %s', (file, expected) => {
      expect(getMfeCacheControl(file)).toBe(expected);
    });
  });

  it('writes the Cache-Control header', () => {
    const res = { setHeader: vi.fn() };

    setMfeCacheHeaders(res, '/dist/remoteEntry.js');

    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
  });

  describe('checkMfeRoot', () => {
    it('accepts an existing directory', () => {
      expect(checkMfeRoot(tmpdir(), true)).toEqual({ ok: true });
    });

    it('fails fast in production when the remote is missing', () => {
      expect(() => checkMfeRoot('/does/not/exist', true)).toThrow('CAPS embed remote not found');
    });

    it('only reports the missing remote outside production', () => {
      expect(checkMfeRoot('/does/not/exist', false)).toEqual({
        ok: false,
        message: expect.stringContaining('/does/not/exist'),
      });
    });
  });
});
