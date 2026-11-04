import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';

import { MonthField } from './MonthField';

vi.mock('@clubmed/trident-icons', () => ({ Icon: () => null }));

const NAME = 'creditCard.expiryDate';

function setup(props: Partial<React.ComponentProps<typeof MonthField>> = {}) {
  let methods!: UseFormReturn;

  const Wrapper = ({ children }: { children: ReactNode }) => {
    methods = useForm();
    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  render(<MonthField label="Expiry date" name={NAME} {...props} />, { wrapper: Wrapper });

  return {
    input: screen.getByRole('textbox') as HTMLInputElement,
    getValue: () => methods.getValues(NAME),
  };
}

describe('MonthField', () => {
  it('formats the input as MM / YYYY and stores YYYY-MM', () => {
    const { input, getValue } = setup();

    fireEvent.change(input, { target: { value: '122030' } });

    expect(input.value).toBe('12 / 2030');
    expect(getValue()).toBe('2030-12');
  });

  it('ignores non digits and extra characters', () => {
    const { input, getValue } = setup();

    fireEvent.change(input, { target: { value: '1a2/20309' } });

    expect(input.value).toBe('12 / 2030');
    expect(getValue()).toBe('2030-12');
  });

  it('keeps the form value empty while the date is incomplete', () => {
    const { input, getValue } = setup();

    fireEvent.change(input, { target: { value: '12' } });
    expect(input.value).toBe('12');
    expect(getValue()).toBe('');

    fireEvent.change(input, { target: { value: '1220' } });
    expect(input.value).toBe('12 / 20');
    expect(getValue()).toBe('');

    fireEvent.change(input, { target: { value: '' } });
    expect(input.value).toBe('');
  });

  it('validates the value on blur', () => {
    const { input, getValue } = setup();

    fireEvent.change(input, { target: { value: '012031' } });
    fireEvent.blur(input);

    expect(getValue()).toBe('2031-01');
  });

  it('shows the default placeholder, or a custom one', () => {
    expect(setup().input.placeholder).toBe('MM / YYYY');
  });

  it('is disabled without placeholder while loading', () => {
    const { input } = setup({ isLoading: true, placeholder: 'Expiry' });

    expect(input.disabled).toBe(true);
    expect(input.placeholder).toBe('');
  });

  it('displays the error', () => {
    setup({ error: 'Invalid date', placeholder: 'Expiry' });

    expect(screen.getByRole('alert').textContent).toBe('Invalid date');
    expect((screen.getByRole('textbox') as HTMLInputElement).placeholder).toBe('Expiry');
  });
});
