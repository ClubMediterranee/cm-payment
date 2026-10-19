import { act, render, screen } from '@testing-library/react';

import { PaymentPage } from './PaymentPage';

const formProps = vi.fn();
const queryParams = vi.hoisted(() => ({ current: {} as Record<string, string> }));
const theme = vi.hoisted(() => ({ current: 'legacy' }));

vi.mock('@clubmed/caps', () => ({
  useDisclosure: () => ({ isOpen: false, onOpen: vi.fn(), onClose: vi.fn() }),
  CapsPaymentForm: (props: unknown) => {
    formProps(props);
    return <button type="submit">Payer</button>;
  },
}));

vi.mock('../components/Stay', () => ({
  Stay: () => <div data-testid="stay" />,
  StayPlaceholder: () => <div />,
}));
vi.mock('../components/StayV2', () => ({
  StayV2: () => <div data-testid="stay-v2" />,
}));
vi.mock('../hooks/useStay', () => ({ useStay: () => ({ status: 'success', stay: {} }) }));
vi.mock('../hooks/useTheme', () => ({ useTheme: () => theme.current }));
vi.mock('../hooks/useQueryParams', () => ({ useQueryParams: () => queryParams.current }));
vi.mock('../providers/AppProvider', () => ({
  useAppContext: () => ({
    id: '123',
    type: 'booking',
    api: { url: 'https://caps.example', apiKey: 'key' },
    oidc: { issuerType: 'GM', accessToken: 'token' },
    values: { locale: 'fr-FR', callbackUrl: 'https://host/cb' },
  }),
}));
vi.mock('./LoadingPage', () => ({ LoadingPage: () => <div data-testid="loading" /> }));

describe('PaymentPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
    queryParams.current = {};
    theme.current = 'legacy';
  });

  it('shows the ticket next to the form with the current theme', () => {
    theme.current = 'current';
    render(<PaymentPage />);

    expect(
      screen.getByRole('heading', { name: 'Payment' }).parentElement!.querySelectorAll('hr'),
    ).toHaveLength(2);
    expect(screen.getByTestId('stay-v2')).toBeTruthy();
    expect(screen.queryByTestId('stay')).toBeNull();
    expect(formProps.mock.lastCall![0]).toEqual(
      expect.objectContaining({ theme: 'current', slots: { donation: null } }),
    );
  });

  it('keeps the legacy stay card and the form in the legacy theme', () => {
    render(<PaymentPage />);

    expect(
      screen.getByRole('heading', { name: 'Payment' }).parentElement!.querySelectorAll('hr'),
    ).toHaveLength(0);
    expect(screen.getByTestId('stay')).toBeTruthy();
    expect(screen.queryByTestId('stay-v2')).toBeNull();
    expect(formProps.mock.lastCall![0]).toEqual(
      expect.objectContaining({ theme: 'legacy', slots: undefined }),
    );
  });

  it('displays the payment error reported by the form', () => {
    Element.prototype.scrollIntoView = vi.fn();
    render(<PaymentPage />);

    act(() =>
      formProps.mock.lastCall![0].onError({ code: 'FLOW_ERROR', message: 'Payment refused' }),
    );

    expect(screen.getByText('Payment refused')).toBeTruthy();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});
