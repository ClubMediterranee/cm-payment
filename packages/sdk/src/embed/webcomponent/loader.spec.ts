import { createInstance } from '@module-federation/runtime';

import { loadCapsRemoteForm, resetCapsRemoteLoaders, toCapsEmbedError } from './loader';

vi.mock('@module-federation/runtime', () => ({
  createInstance: vi.fn(),
}));

const remoteModule = { default: () => ({ render() {}, destroy() {} }), protocolVersion: 1 };

describe('loadCapsRemoteForm', () => {
  const loadRemote = vi.fn();

  beforeEach(() => {
    resetCapsRemoteLoaders();
    loadRemote.mockReset().mockResolvedValue(remoteModule);
    vi.mocked(createInstance)
      .mockReset()
      .mockReturnValue({ loadRemote } as never);
  });

  it('loads the bridge module from the CAPS manifest without sharing anything', async () => {
    await expect(loadCapsRemoteForm('https://caps.example')).resolves.toBe(remoteModule);

    const options = vi.mocked(createInstance).mock.calls[0][0];
    expect(options.remotes).toEqual([
      { name: 'caps', entry: 'https://caps.example/mfe/mf-manifest.json' },
    ]);
    expect(options.shared).toBeUndefined();
    expect(options.name).toMatch(/^caps_host_/);
    expect(loadRemote).toHaveBeenCalledWith('caps/CapsForm');
  });

  it('loads a given CAPS url once', async () => {
    await Promise.all([
      loadCapsRemoteForm('https://caps.example'),
      loadCapsRemoteForm('https://caps.example'),
    ]);

    expect(createInstance).toHaveBeenCalledTimes(1);
  });

  it('reports a network failure and allows a retry', async () => {
    loadRemote.mockRejectedValueOnce(new Error('Failed to fetch'));

    await expect(loadCapsRemoteForm('https://caps.example')).rejects.toMatchObject({
      code: 'REMOTE_LOAD_FAILED',
      message: expect.stringContaining('Failed to fetch'),
    });
    await expect(loadCapsRemoteForm('https://caps.example')).resolves.toBe(remoteModule);
  });

  it('rejects an incompatible protocol version', async () => {
    loadRemote.mockResolvedValue({ ...remoteModule, protocolVersion: 2 });

    await expect(loadCapsRemoteForm('https://caps.example')).rejects.toMatchObject({
      code: 'PROTOCOL_MISMATCH',
    });
  });
});

describe('toCapsEmbedError', () => {
  it('maps unknown errors to REMOTE_LOAD_FAILED', () => {
    expect(toCapsEmbedError(new Error('boom'))).toEqual({
      code: 'REMOTE_LOAD_FAILED',
      message: 'boom',
    });
    expect(toCapsEmbedError('boom')).toEqual({ code: 'REMOTE_LOAD_FAILED', message: 'boom' });
  });

  it('passes through errors that already carry a code', () => {
    expect(toCapsEmbedError({ code: 'PROTOCOL_MISMATCH', message: 'nope' })).toEqual({
      code: 'PROTOCOL_MISMATCH',
      message: 'nope',
    });
  });
});
