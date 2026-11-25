import { render, screen } from '@testing-library/react';

import { usePaymentRedirectState } from '../../../hooks/data/usePaymentRedirect/index.js';
import { usePaymentStatus } from '../../../hooks/data/usePaymentStatus/index.js';
import { useCountdown } from '../../../hooks/utils/useCountdown.js';
import { usePaymentProviderSettings } from '../../../hooks/utils/usePaymentProviderSettings.js';
import { PspProviders } from '../../../types/PspProviders.js';
import { loadPaymentProviderUrl } from '../../../utils/loadPaymentProviderUrl.js';
import { WeChatQRView } from './WeChatQRView.js';

const clearMutations = vi.fn();

vi.mock('@clubmed/trident-icons', () => ({ Icon: () => null }));
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => <svg data-testid="qr-code" data-value={value} />,
}));
const queryClient = { getMutationCache: () => ({ clear: clearMutations }) };

vi.mock('@tanstack/react-query', () => ({ useQueryClient: () => queryClient }));
vi.mock('../../../hooks/data/usePaymentRedirect/index.js', () => ({
  usePaymentRedirectState: vi.fn(),
}));
vi.mock('../../../hooks/data/usePaymentStatus/index.js', () => ({ usePaymentStatus: vi.fn() }));
vi.mock('../../../hooks/utils/useCountdown.js', () => ({ useCountdown: vi.fn() }));
vi.mock('../../../hooks/utils/usePaymentProviderSettings.js', () => ({
  usePaymentProviderSettings: vi.fn(),
}));
const values = vi.hoisted(() => ({ cgv: true }));

vi.mock('../../../hooks/utils/useForm.js', () => ({
  useWatch: (name: string) => ({ amount: '1000', currency: 'EUR', cgv: values.cgv })[name],
}));
vi.mock('../../../hooks/utils/useCapsConfigContext.js', () => ({
  useCapsConfigContext: () => ({
    locale: 'fr-FR',
    content: {
      wechat: {
        instruction: 'Scan the QR code to pay {amount}',
        payLabel: 'Pay',
        imageUrl: 'https://cdn.example/tutorial.png',
        imageAlt: 'Scanning with WeChat',
        qrCodeLabel: 'WeChat Pay QR code',
        expiredMessage: 'The QR code has expired',
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
    values.cgv = true;
    vi.mocked(usePaymentProviderSettings).mockReturnValue({
      qr_timeout_seconds: 300,
      poll_interval_seconds: 5,
    });
    vi.mocked(usePaymentRedirectState).mockReturnValue(undefined as never);
    vi.mocked(useCountdown).mockReturnValue({ secondsRemaining: 125, expired: false } as never);
    vi.mocked(usePaymentStatus).mockReturnValue({ data: undefined, isSuccess: false } as never);
  });

  it('waits for the terms to be accepted', () => {
    values.cgv = false;

    const { container } = render(<WeChatQRView />);

    expect(container.innerHTML).toBe('');
  });

  it('shows the instruction and the illustration once the terms are accepted', () => {
    render(<WeChatQRView />);

    expect(screen.getByText(/Scan the QR code to pay 1.000,00/)).toBeTruthy();
    expect(screen.getByAltText('Scanning with WeChat').getAttribute('src')).toBe(
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

    expect(usePaymentRedirectState).toHaveBeenCalledWith({ providerId: PspProviders.M99BILLW });
    expect(usePaymentProviderSettings).toHaveBeenCalledWith(PspProviders.M99BILLW);
  });

  it('replaces the illustration with the QR code, the amount and the countdown once the payment is created', () => {
    vi.mocked(usePaymentRedirectState).mockReturnValue(payment as never);

    render(<WeChatQRView />);

    expect(screen.getByTestId('qr-code').dataset.value).toBe('weixin://pay/qr');
    expect(screen.queryByAltText('Scanning with WeChat')).toBeNull();
    expect(screen.getByText('2:05')).toBeTruthy();
    expect(screen.getByText(/^Pay 1.000,00/)).toBeTruthy();
    expect(useCountdown).toHaveBeenCalledWith(300);
    expect(clearMutations).toHaveBeenCalledTimes(1);
    expect(usePaymentStatus).toHaveBeenCalledWith('pay-1', { pollIntervalMs: 5000, enabled: true });
  });

  it('drops the payment once the QR code expires and falls back to the illustration with a message', () => {
    const { rerender } = render(<WeChatQRView />);

    vi.mocked(usePaymentRedirectState).mockReturnValue(payment as never);
    vi.mocked(useCountdown).mockReturnValue({ secondsRemaining: 0, expired: true } as never);
    clearMutations.mockImplementationOnce(() =>
      vi.mocked(usePaymentRedirectState).mockReturnValue(undefined as never),
    );
    rerender(<WeChatQRView />);

    expect(clearMutations).toHaveBeenCalledTimes(2);
    expect(screen.getByText('The QR code has expired')).toBeTruthy();
    expect(screen.queryByTestId('qr-code')).toBeNull();
    expect(screen.getByAltText('Scanning with WeChat')).toBeTruthy();
    expect(usePaymentStatus).toHaveBeenLastCalledWith(undefined, {
      pollIntervalMs: 5000,
      enabled: false,
    });
  });

  it('uses the default polling interval and no timeout without provider settings', () => {
    vi.mocked(usePaymentProviderSettings).mockReturnValue({});
    vi.mocked(usePaymentRedirectState).mockReturnValue(payment as never);

    render(<WeChatQRView />);

    expect(useCountdown).toHaveBeenCalledWith(0);
    expect(usePaymentStatus).toHaveBeenCalledWith('pay-1', {
      pollIntervalMs: 2000,
      enabled: true,
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
