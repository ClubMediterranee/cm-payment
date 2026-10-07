import { render, screen, waitFor } from '@testing-library/react';

import type { CapsEnv } from '../shared/types';
import { CapsFormSlot } from './CapsFormSlot';
import { CapsFormWebComponent } from './CapsFormWebComponent';
import { loadCapsRemoteForm } from './loader';

vi.mock('./loader', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./loader')>()),
  loadCapsRemoteForm: vi.fn(),
}));

const RemoteForm = vi.fn((props: Record<string, unknown>) => (
  <div data-testid="remote-form" className={props.className as string}>
    {String(props.capsUrl)}
  </div>
));

// Host side of the bridge: renders the remote root component with the host props, or the fallback on error.
vi.mock('@module-federation/bridge-react/base', async () => {
  const { useEffect, useState } = await import('react');

  return {
    createRemoteAppComponent: ({
      loader,
      fallback: Fallback,
    }: {
      loader: () => Promise<{ default: unknown }>;
      fallback: (props: { error: Error }) => null;
    }) =>
      function BridgeComponent(props: Record<string, unknown>) {
        const [module, setModule] = useState<{ default: unknown }>();

        useEffect(() => {
          loader().then(setModule);
        }, []);

        if (!module) {
          return null;
        }

        if (module.default === 'crash') {
          return <Fallback error={new Error('remote crashed')} />;
        }

        return <RemoteForm {...props} />;
      },
  };
});

const remoteModule = { default: () => ({}), protocolVersion: 1 };

const flowProps = {
  issuerType: 'GM' as const,
  type: 'booking' as const,
  id: '123',
  callbackUrl: 'https://host.example/cb',
};

describe('CapsFormWebComponent', () => {
  beforeEach(() => {
    RemoteForm.mockClear();
    vi.mocked(loadCapsRemoteForm)
      .mockReset()
      .mockResolvedValue(remoteModule as never);
  });

  it('renders the fallback while loading, then the remote form of the environment', async () => {
    render(
      <CapsFormWebComponent
        {...flowProps}
        env="staging"
        accessToken="token"
        fallback={<span>loading…</span>}
      />,
    );

    expect(screen.getByText('loading…')).toBeTruthy();
    expect((await screen.findByTestId('remote-form')).textContent).toBe(
      'https://staging.caps.api.clubmed',
    );
    expect(loadCapsRemoteForm).toHaveBeenCalledWith('https://staging.caps.api.clubmed');
    expect(RemoteForm.mock.lastCall![0]).toMatchObject({
      ...flowProps,
      accessToken: 'token',
      capsUrl: 'https://staging.caps.api.clubmed',
    });
    expect(RemoteForm.mock.lastCall![0]).not.toHaveProperty('env');
    expect(RemoteForm.mock.lastCall![0]).not.toHaveProperty('fallback');
  });

  it('forwards the host slots to the remote form', async () => {
    const { container } = render(
      <>
        <CapsFormWebComponent {...flowProps} />
        <aside>
          <CapsFormSlot name="donation" />
          <CapsFormSlot name="submit" />
        </aside>
      </>,
    );

    await screen.findByTestId('remote-form');

    expect(RemoteForm.mock.lastCall![0].slots).toEqual({
      donation: container.querySelector('[data-caps-slot="donation"]'),
      submit: container.querySelector('[data-caps-slot="submit"]'),
    });
  });

  it('gives precedence to an explicit url', async () => {
    render(<CapsFormWebComponent {...flowProps} env="production" url="https://localhost:8083/" />);

    await screen.findByTestId('remote-form');
    expect(loadCapsRemoteForm).toHaveBeenCalledWith('https://localhost:8083');
  });

  it('forwards prop updates without reloading the remote', async () => {
    const { rerender } = render(<CapsFormWebComponent {...flowProps} accessToken="a" />);
    await screen.findByTestId('remote-form');

    rerender(<CapsFormWebComponent {...flowProps} accessToken="b" />);

    await waitFor(() => expect(RemoteForm.mock.lastCall![0]).toMatchObject({ accessToken: 'b' }));
    expect(loadCapsRemoteForm).toHaveBeenCalledTimes(1);
  });

  it('reports a load failure through onError and renders nothing', async () => {
    const onError = vi.fn();
    vi.mocked(loadCapsRemoteForm).mockRejectedValue({
      code: 'REACT_VERSION_UNSUPPORTED',
      message: 'React 18 is not supported',
    });

    const { container } = render(
      <CapsFormWebComponent {...flowProps} onError={onError} fallback={<span>loading…</span>} />,
    );

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith({
        code: 'REACT_VERSION_UNSUPPORTED',
        message: 'React 18 is not supported',
      }),
    );
    expect(container.innerHTML).toBe('');
  });

  it('reports an unknown environment', async () => {
    const onError = vi.fn();

    render(<CapsFormWebComponent {...flowProps} env={'qa' as CapsEnv} onError={onError} />);

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: 'REMOTE_LOAD_FAILED' })),
    );
    expect(loadCapsRemoteForm).not.toHaveBeenCalled();
  });

  it('applies className and style to the host container', async () => {
    render(<CapsFormWebComponent {...flowProps} className="checkout" />);

    expect((await screen.findByTestId('remote-form')).className).toBe('checkout');
  });

  it('reports bridge failures through onError', async () => {
    const onError = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(loadCapsRemoteForm).mockResolvedValue({ ...remoteModule, default: 'crash' } as never);

    render(
      <div data-testid="host">
        <CapsFormWebComponent {...flowProps} onError={onError} />
      </div>,
    );

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith({ code: 'FLOW_ERROR', message: 'remote crashed' }),
    );
    expect(screen.getByTestId('host').innerHTML).toBe('');
    vi.mocked(console.error).mockRestore();
  });
});
