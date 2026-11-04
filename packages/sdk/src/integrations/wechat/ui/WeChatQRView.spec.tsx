import { render, screen } from '@testing-library/react';

import { usePaymentRedirectState } from '../../../hooks/data/usePaymentRedirect/index.js';
import { usePaymentStatus } from '../../../hooks/data/usePaymentStatus/index.js';
import { useCountdown } from '../../../hooks/utils/useCountdown.js';
import { useWatchedPaymentProvider } from '../../../hooks/utils/useWatchedPaymentProvider.js';
import { PspProviders } from '../../../types/PspProviders.js';
import { loadPaymentProviderUrl } from '../../../utils/loadPaymentProviderUrl.js';
import { WeChatQRView } from './WeChatQRView.js';

const clearMutations = vi.fn();

vi.mock('@clubmed/trident-icons', () => ({ Icon: () => null }));
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => <svg data-testid="qr-code" data-value={value} />,
}));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ getMutationCache: () => ({ clear: clearMutations }) }),
}));
vi.mock('../../../hooks/data/usePaymentRedirect/index.js', () => ({
  usePaymentRedirectState: vi.fn(),
}));
vi.mock('../../../hooks/data/usePaymentStatus/index.js', () => ({ usePaymentStatus: vi.fn() }));
vi.mock('../../../hooks/utils/useCountdown.js', () => ({ useCountdown: vi.fn() }));
vi.mock('../../../hooks/utils/useWatchedPaymentProvider.js', () => ({
  useWatchedPaymentProvider: vi.fn(),
}));
vi.mock('../../../hooks/utils/useForm.js', () => ({
  useWatch: (name: string) => ({ amount: '1000', currency: 'EUR' })[name],
}));
vi.mock('../../../hooks/utils/useCapsConfigContext.js', () => ({
  useCapsConfigContext: () => ({
    locale: 'fr-FR',
    content: {
      wechat: {
        payLabel: 'Pay',
        scanLabel: 'Scan the QR code',
        tutorial: {
          title: 'How to pay',
          subtitle: 'With WeChat',
          imageUrl: 'https://cdn.example/tutorial.png',
          expiredMessage: 'The QR code has expired',
        },
      },
    },
  }),
}));
vi.mock('../../../utils/loadPaymentProviderUrl.js', () => ({ loadPaymentProviderUrl: vi.fn() }));

const payment = {
  payment: { paymentId: 'pay-1', callbacks: { callback_url: 'https://caps.example/callback' } },
  redirect: { url: 'weixin://pay/qr' },
};

describe('WeChatQRView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useWatchedPaymentProvider).mockReturnValue({
      configuration: { settings: { qr_timeout_seconds: '300', poll_interval_seconds: '5' } },
    } as never);
    vi.mocked(usePaymentRedirectState).mockReturnValue(undefined as never);
    vi.mocked(useCountdown).mockReturnValue({ secondsRemaining: 125, expired: false } as never);
    vi.mocked(usePaymentStatus).mockReturnValue({ data: undefined, isSuccess: false } as never);
  });

  it('shows the tutorial before the payment is created', () => {
    render(<WeChatQRView />);

    expect(screen.getByText('How to pay')).toBeTruthy();
    expect(screen.getByAltText('WeChat payment tutorial').getAttribute('src')).toBe(
      'https://cdn.example/tutorial.png',
    );
    expect(screen.queryByTestId('qr-code')).toBeNull();
    expect(clearMutations).toHaveBeenCalledTimes(1);
    expect(usePaymentStatus).toHaveBeenCalledWith(undefined, {
      pollIntervalMs: 5000,
      enabled: false,
    });
  });

  it('only reads the WeChat payment', () => {
    render(<WeChatQRView />);

    const { predicate } = vi.mocked(usePaymentRedirectState).mock.calls[0][0]!;

    expect(
      predicate!({ state: { variables: { provider_id: PspProviders.M99BILLW } } } as never),
    ).toBe(true);
    expect(predicate!({ state: { variables: { provider_id: PspProviders.HIPAY } } } as never)).toBe(
      false,
    );
  });

  it('shows the QR code, the amount and the countdown once the payment is created', () => {
    vi.mocked(usePaymentRedirectState).mockReturnValue(payment as never);

    render(<WeChatQRView />);

    expect(screen.getByTestId('qr-code').dataset.value).toBe('weixin://pay/qr');
    expect(screen.getByText('2:05')).toBeTruthy();
    expect(screen.getByText(/1.000,00/)).toBeTruthy();
    expect(screen.getByText('Scan the QR code')).toBeTruthy();
    expect(useCountdown).toHaveBeenCalledWith(300, 'pay-1');
    expect(usePaymentStatus).toHaveBeenCalledWith('pay-1', { pollIntervalMs: 5000, enabled: true });
  });

  it('falls back to the tutorial with a message when the QR code has expired', () => {
    vi.mocked(usePaymentRedirectState).mockReturnValue(payment as never);
    vi.mocked(useCountdown).mockReturnValue({ secondsRemaining: 0, expired: true } as never);

    render(<WeChatQRView />);

    expect(screen.getByText('The QR code has expired')).toBeTruthy();
    expect(screen.queryByTestId('qr-code')).toBeNull();
    expect(usePaymentStatus).toHaveBeenCalledWith('pay-1', {
      pollIntervalMs: 5000,
      enabled: false,
    });
  });

  it('uses the default polling interval and no timeout without provider settings', () => {
    vi.mocked(useWatchedPaymentProvider).mockReturnValue(undefined as never);

    render(<WeChatQRView />);

    expect(useCountdown).toHaveBeenCalledWith(0, undefined);
    expect(usePaymentStatus).toHaveBeenCalledWith(undefined, {
      pollIntervalMs: 2000,
      enabled: false,
    });
  });

  it('waits while the payment is pending', () => {
    vi.mocked(usePaymentRedirectState).mockReturnValue(payment as never);
    vi.mocked(usePaymentStatus).mockReturnValue({
      data: { payment_status: 'PENDING' },
      isSuccess: true,
    } as never);

    render(<WeChatQRView />);

    expect(loadPaymentProviderUrl).not.toHaveBeenCalled();
  });

  it('goes to the callback url once the payment is settled', () => {
    vi.mocked(usePaymentRedirectState).mockReturnValue(payment as never);
    vi.mocked(usePaymentStatus).mockReturnValue({
      data: { payment_status: 'ACCEPTED' },
      isSuccess: true,
    } as never);

    render(<WeChatQRView />);

    expect(loadPaymentProviderUrl).toHaveBeenCalledWith({
      url: 'https://caps.example/callback',
      method: 'GET',
    });
  });
});
