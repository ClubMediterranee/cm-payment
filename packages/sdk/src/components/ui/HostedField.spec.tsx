import { render, screen } from '@testing-library/react';

import type { HostedFieldState } from '../../hooks/useHostedFieldsState';
import { HostedField } from './HostedField';

vi.mock('@clubmed/trident-icons', () => ({
  Icon: ({ name }: { name: string }) => <i data-icon={name} />,
}));

const ID = 'card-number';

const IDLE: HostedFieldState = { status: 'default', focused: false, filled: false };

const setup = (state: Partial<HostedFieldState> = {}) => {
  const { container } = render(
    <HostedField
      id={ID}
      label="Card number"
      hint="16 digits"
      icon="CreditCard"
      state={{ ...IDLE, ...state }}
    />,
  );

  return {
    mountPoint: container.querySelector(`#${ID}`)!,
    icon: () => container.querySelector('[data-icon]')?.getAttribute('data-icon'),
  };
};

describe('HostedField', () => {
  it('labels the field group with a HostedField-label', () => {
    setup();

    const label = screen.getByText('Card number');
    expect(label.className).toContain('HostedField-label');
    expect(screen.getByRole('group', { name: 'Card number' })).toBeTruthy();
  });

  it('draws the neutral border with the card icon by default', () => {
    const { mountPoint, icon } = setup();

    expect(mountPoint.className).toContain('inset-ring-middleGrey');
    expect(mountPoint.className).toContain('focus-within:inset-ring-black');
    expect(icon()).toBe('CreditCard');
    expect(screen.queryByText('16 digits')).toBeNull();
  });

  it('draws the black border and the format hint while focused', () => {
    const { mountPoint } = setup({ focused: true });

    expect(mountPoint.className).toContain('inset-ring-black');
    expect(mountPoint.className).not.toContain('inset-ring-middleGrey');
    expect(screen.getByText('16 digits')).toBeTruthy();
  });

  it('keeps the format hint once filled', () => {
    setup({ filled: true });

    expect(screen.getByText('16 digits')).toBeTruthy();
  });

  it('shows the success state with a check', () => {
    const { mountPoint, icon } = setup({ status: 'success', filled: true });

    expect(mountPoint.className).toContain('inset-ring-green');
    expect(icon()).toBe('CheckDefault');
  });

  it('shows the error state with a cross and its message', () => {
    const { mountPoint, icon } = setup({ status: 'error', error: 'Invalid card number' });

    expect(mountPoint.className).toContain('inset-ring-red');
    expect(icon()).toBe('CrossDefault');
    expect(screen.getByTestId('FormControlError').textContent).toBe('Invalid card number');
  });

  it('pulses while loading', () => {
    const { mountPoint } = setup();
    expect(mountPoint.className).toContain('bg-white');

    render(<HostedField id="cvc" label="CVV" state={IDLE} isLoading />);
    expect(document.getElementById('cvc')!.className).toContain('animate-pulsation');
  });
});
