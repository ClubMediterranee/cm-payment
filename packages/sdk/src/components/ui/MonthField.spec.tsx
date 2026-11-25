import { act, fireEvent, render, screen } from '@testing-library/react';
import type { FieldErrors, Resolver } from 'react-hook-form';

import { createFormWrapper } from '../../__fixtures__/createFormWrapper';
import type { CapsFormSchema } from '../../schemas/capsFormSchema';
import { parseExpiryDate } from '../../schemas/validations/validateExpiryDate';
import { formatMonth, MonthField } from './MonthField';

vi.mock('@clubmed/trident-icons', () => ({ Icon: () => null }));

const INVALID_DATE: FieldErrors<CapsFormSchema> = {
  creditCard: { expiryDate: { type: 'custom', message: 'Invalid date' } },
};

const resolver: Resolver<CapsFormSchema> = async (values) =>
  parseExpiryDate(values.creditCard?.expiryDate)
    ? { values, errors: {} }
    : { values: {}, errors: INVALID_DATE };

function setup(props: Partial<React.ComponentProps<typeof MonthField>> = {}) {
  const { wrapper, getValues, submit } = createFormWrapper({ resolver });

  render(<MonthField label="Expiration" placeholder="YYYY / MM" hint="YYYY / MM" {...props} />, {
    wrapper,
  });

  const input = screen.getByRole<HTMLInputElement>('textbox');

  return {
    input,
    submit,
    getValue: () => getValues().creditCard?.expiryDate,
    type: (value: string) => act(async () => fireEvent.change(input, { target: { value } })),
    blur: () => act(async () => fireEvent.blur(input)),
  };
}

describe('formatMonth', () => {
  it.each([
    ['2030', '2030'],
    ['20301', '2030 / 1'],
    ['203012', '2030 / 12'],
    ['2a03/0129', '2030 / 12'],
    ['2030/', '2030 / '],
    ['2030 / ', '2030 / '],
    ['2030 /', '2030'],
    ['', ''],
  ])('formats %j as %j', (input, expected) => {
    expect(formatMonth(input)).toBe(expected);
  });
});

describe('MonthField', () => {
  it('formats the input as YYYY / MM and stores the formatted value', async () => {
    const { input, getValue, type } = setup();

    await type('203012');

    expect(input.value).toBe('2030 / 12');
    expect(getValue()).toBe('2030 / 12');
  });

  it('is labelled by its visible label', () => {
    setup();

    expect(screen.getByRole('textbox', { name: 'Expiration' })).toBeTruthy();
  });

  it('shows the expected format beside the label while focused or filled', async () => {
    const { input, type, blur } = setup();

    expect(screen.queryAllByText('YYYY / MM', { selector: 'span' })).toHaveLength(0);

    act(() => input.focus());
    expect(screen.getByText('YYYY / MM', { selector: 'span' })).toBeTruthy();

    await type('2030');
    await blur();

    expect(screen.getByText('YYYY / MM', { selector: 'span' })).toBeTruthy();
  });

  it('keeps an incomplete date neutral while typing, then shows its error on blur', async () => {
    const { type, blur } = setup();

    await type('20301');
    expect(screen.queryByText('Invalid date')).toBeNull();

    await blur();
    expect(screen.getByText('Invalid date')).toBeTruthy();

    await type('203012');
    expect(screen.queryByText('Invalid date')).toBeNull();
  });

  it('leaves an empty field neutral on blur and shows its error once submitted', async () => {
    const { blur, submit } = setup();

    await blur();
    expect(screen.queryByText('Invalid date')).toBeNull();

    await submit();
    expect(screen.getByText('Invalid date')).toBeTruthy();
  });

  it('is disabled without placeholder while loading', () => {
    const { input } = setup({ isLoading: true });

    expect(input.disabled).toBe(true);
    expect(input.placeholder).toBe('');
  });
});
