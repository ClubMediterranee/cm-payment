import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { PropsWithChildren } from 'react';

import { StatutPaiement } from '../../__generated__/index.schemas';
import { usePaymentRedirectState } from '../../hooks/data/usePaymentRedirect';
import { usePaymentStatus } from '../../hooks/data/usePaymentStatus';
import { useCapsConfigContext } from '../../hooks/utils/useCapsConfigContext';
import { useCountdown } from '../../hooks/utils/useCountdown';
import { useWatchedPaymentProvider } from '../../hooks/utils/useWatchedPaymentProvider';
import { loadPaymentProviderUrl } from '../../utils/loadPaymentProviderUrl';
import { WeChatQRView } from './WeChatQRView';

vi.mock('qrcode.react', () => ({ QRCodeSVG: () => null }));
vi.mock('@clubmed/trident-icons', () => ({ Icon: () => null }));
vi.mock('../../hooks/data/usePaymentRedirect', () => ({
  usePaymentRedirectState: vi.fn(),
}));
vi.mock('../../hooks/data/usePaymentStatus', () => ({ usePaymentStatus: vi.fn() }));
vi.mock('../../hooks/utils/useCapsConfigContext', () => ({ useCapsConfigContext: vi.fn() }));
vi.mock('../../hooks/utils/useCountdown', () => ({ useCountdown: vi.fn() }));
vi.mock('../../hooks/utils/useWatchedPaymentProvider', () => ({
  useWatchedPaymentProvider: vi.fn(),
}));
vi.mock('../../hooks/utils/useForm', () => ({
  useWatch: vi.fn((name: string) => (name === 'currency' ? 'EUR' : 100)),
}));
vi.mock('../../utils/loadPaymentProviderUrl', () => ({ loadPaymentProviderUrl: vi.fn() }));

const mockUsePaymentRedirectState = vi.mocked(usePaymentRedirectState);
const mockUsePaymentStatus = vi.mocked(usePaymentStatus);
const mockUseCapsConfigContext = vi.mocked(useCapsConfigContext);
const mockUseCountdown = vi.mocked(useCountdown);
const mockUseWatchedPaymentProvider = vi.mocked(useWatchedPaymentProvider);
const mockLoadPaymentProviderUrl = vi.mocked(loadPaymentProviderUrl);

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

const renderView = () => render(<WeChatQRView />, { wrapper });

const callbacks = {
  callback_url: 'https://payment.clubmed.com/rest/payment_redirect/payment-1?callback_url=seller',
};

const paymentStatus = {
  payment_status: StatutPaiement.OK,
  booking_id: 'booking-1',
  payment_amount: '100',
  payment_currency: 'EUR',
  provider_id: 'M99BILLW',
};

describe('WeChatQRView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCapsConfigContext.mockReturnValue({
      content: { wechat: { tutorial: {}, payLabel: '', scanLabel: '' } },
      locale: 'fr-FR',
    } as any);
    mockUseWatchedPaymentProvider.mockReturnValue({
      configuration: { settings: { qr_timeout_seconds: 300, poll_interval_seconds: 2 } },
    } as any);
    mockUseCountdown.mockReturnValue({ secondsRemaining: 300, expired: false });
    mockUsePaymentRedirectState.mockReturnValue({
      redirect: { url: 'weixin://wxpay/qr', method: 'GET' },
      payment: { paymentId: 'payment-1', callbacks },
    } as any);
  });

  it('navigates to the server callback url via loadPaymentProviderUrl on confirmed payment', () => {
    mockUsePaymentStatus.mockReturnValue({ data: paymentStatus, isSuccess: true } as any);

    renderView();

    expect(mockLoadPaymentProviderUrl).toHaveBeenCalledWith({
      url: callbacks.callback_url,
      method: 'GET',
    });
  });

  it('does not navigate while the payment is still pending', () => {
    mockUsePaymentStatus.mockReturnValue({
      data: { ...paymentStatus, payment_status: StatutPaiement.PENDING },
      isSuccess: true,
    } as any);

    renderView();

    expect(mockLoadPaymentProviderUrl).not.toHaveBeenCalled();
  });

  it('does not navigate when the status query has not succeeded', () => {
    mockUsePaymentStatus.mockReturnValue({ data: undefined, isSuccess: false } as any);

    renderView();

    expect(mockLoadPaymentProviderUrl).not.toHaveBeenCalled();
  });
});
