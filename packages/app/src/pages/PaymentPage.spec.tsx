import { act, render, screen } from '@testing-library/react';

import { PaymentPage } from './PaymentPage';

const formProps = vi.fn();

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
vi.mock('../hooks/useStay', () => ({ useStay: () => ({ status: 'success', stay: {} }) }));
vi.mock('../hooks/useQueryParams', () => ({ useQueryParams: () => ({}) }));
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
