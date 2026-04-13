import { render, screen } from '@testing-library/react';

import { ConfirmationPage } from './ConfirmationPage';

vi.mock('@clubmed/caps', () => ({
  FormPanel: ({ children, className }: any) => (
    <div data-testid="panel" className={className}>
      {children}
    </div>
  ),
  formatCurrency: vi.fn(),
}));

vi.mock('@clubmed/trident-icons', () => ({
  Icon: ({ name, className }: any) => (
    <div data-testid="status-icon" data-name={name} className={className} />
  ),
}));

vi.mock('../hooks/useAppParams', () => ({
  useAppParams: vi.fn(),
}));

import { formatCurrency } from '@clubmed/caps';

import { useAppParams } from '../hooks/useAppParams';

describe('ConfirmationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(formatCurrency).mockReturnValue('€123.45');
    vi.mocked(useAppParams).mockReturnValue({
      oidc: {
        issuerType: 'GM',
      },
      values: {
        payment_status: 'OK',
        booking_id: 'BOOK-123',
        payment_amount: '123.45',
        payment_currency: 'EUR',
        locale: 'fr-FR',
      },
    } as any);
  });

  it('renders a success confirmation', () => {
    render(<ConfirmationPage />);

    expect(screen.getByText('Payment confirmation - GM')).toBeTruthy();
    expect(screen.getByText('Your payment has been validated')).toBeTruthy();
    expect(screen.getByText('BOOK-123')).toBeTruthy();
    expect(screen.getByText('€123.45')).toBeTruthy();
    expect(screen.getByTestId('status-icon').getAttribute('data-name')).toBe('CheckOutlined');
    expect(formatCurrency).toHaveBeenCalledWith({
      amount: 123.45,
      currency: 'EUR',
      locale: 'fr-FR',
    });
  });

  it('renders a failed confirmation when payment status is not OK', () => {
    vi.mocked(useAppParams).mockReturnValue({
      oidc: {
        issuerType: 'GO',
      },
      values: {
        payment_status: 'FAILED',
        booking_id: 'BOOK-404',
        payment_amount: '10',
        payment_currency: 'USD',
        locale: 'en-US',
      },
    } as any);
    vi.mocked(formatCurrency).mockReturnValue('$10.00');

    render(<ConfirmationPage />);

    expect(screen.getByText('Payment confirmation - GO')).toBeTruthy();
    expect(screen.getByText('Your payment has failed')).toBeTruthy();
    expect(screen.getByText('BOOK-404')).toBeTruthy();
    expect(screen.getByText('$10.00')).toBeTruthy();
    expect(screen.getByTestId('status-icon').getAttribute('data-name')).toBe('CrossOutlined');
  });
});
