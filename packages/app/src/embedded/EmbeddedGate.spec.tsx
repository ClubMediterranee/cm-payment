import { render, screen } from '@testing-library/react';

import { EmbeddedGate } from './EmbeddedGate';
import { useEmbedded } from './EmbeddedProvider';

vi.mock('@clubmed/caps', () => ({ CapsMessageType: { ERROR: 'CAPS_ERROR' } }));

vi.mock('react-oidc-context', () => ({
  useAuth: () => ({ error: undefined, signinPopup: vi.fn() }),
}));

vi.mock('../pages/LoadingPage', () => ({
  LoadingPage: () => <div data-testid="loading-page" />,
}));

vi.mock('./EmbeddedProvider', () => ({ useEmbedded: vi.fn() }));

const embedded = (overrides: Record<string, unknown>) => ({
  active: true,
  status: 'allowed',
  parentOrigin: 'https://host.example',
  handshakeDone: true,
  post: vi.fn(),
  navigate: vi.fn(),
  ...overrides,
});

function renderGate() {
  return render(
    <EmbeddedGate>
      <div data-testid="flow" />
    </EmbeddedGate>,
  );
}

describe('EmbeddedGate', () => {
  it('renders the flow outside the embedded mode', () => {
    vi.mocked(useEmbedded).mockReturnValue({ active: false });
    renderGate();

    expect(screen.queryByTestId('flow')).toBeTruthy();
  });

  it.each([
    ['the parent origin is being validated', { status: 'validating', handshakeDone: false }],
    ['the host token has not been received yet', { handshakeDone: false }],
  ])('waits while %s', (_, overrides) => {
    vi.mocked(useEmbedded).mockReturnValue(embedded(overrides) as never);
    renderGate();

    expect(screen.queryByTestId('loading-page')).toBeTruthy();
    expect(screen.queryByTestId('flow')).toBeNull();
  });

  it('renders the flow once the handshake is done', () => {
    vi.mocked(useEmbedded).mockReturnValue(embedded({ hostToken: 'token' }) as never);
    renderGate();

    expect(screen.queryByTestId('flow')).toBeTruthy();
  });

  it('refuses a parent that is not allowed', () => {
    vi.mocked(useEmbedded).mockReturnValue(
      embedded({ status: 'rejected', handshakeDone: false }) as never,
    );
    renderGate();

    expect(screen.getByRole('alert').textContent).toContain('Integration not allowed');
    expect(screen.queryByTestId('flow')).toBeNull();
  });
});
