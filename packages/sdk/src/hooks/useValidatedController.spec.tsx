import { act, renderHook } from '@testing-library/react';
import type { FieldErrors, Resolver } from 'react-hook-form';

import { createFormWrapper } from '../__fixtures__/createFormWrapper';
import type { CapsFormSchema } from '../schemas/capsFormSchema';
import { useValidatedController } from './useValidatedController';

const zipError = (message: string): FieldErrors<CapsFormSchema> => ({
  billing_details: { address: { zip_code: { type: 'custom', message } } },
});

const resolver: Resolver<CapsFormSchema> = async (values) => {
  const zip = values.billing_details?.address?.zip_code ?? '';

  return /^\d{5}$/.test(zip)
    ? { values, errors: {} }
    : { values: {}, errors: zipError(zip ? 'Invalid zip' : 'Required') };
};

const setup = (defaultValues: Partial<CapsFormSchema> = {}) => {
  const { wrapper, submit } = createFormWrapper({ resolver, defaultValues });
  const hook = renderHook(() => useValidatedController('billing_details.address.zip_code'), {
    wrapper,
  });

  return {
    ...hook,
    submit,
    type: (value: string) => act(() => hook.result.current.onChange(value)),
    blur: () => act(() => hook.result.current.onBlur()),
  };
};

describe('useValidatedController', () => {
  it('starts neutral, with an empty string for a missing value', () => {
    const { result } = setup();

    expect(result.current).toMatchObject({ value: '', status: 'default', errorMessage: undefined });
  });

  it('turns green as soon as the value is valid while typing', async () => {
    const { result, type } = setup();

    await type('7500');
    expect(result.current.status).toBe('default');

    await type('75008');
    expect(result.current).toMatchObject({ value: '75008', status: 'success' });
  });

  it('shows the error of an incorrect value on blur and keeps it while still incorrect', async () => {
    const { result, type, blur } = setup();

    await type('750');
    await blur();
    expect(result.current).toMatchObject({ status: 'error', errorMessage: 'Invalid zip' });

    await type('7500');
    expect(result.current.status).toBe('error');

    await type('');
    expect(result.current.status).toBe('default');
  });

  it('leaves an empty field neutral on blur, and shows it in error once submitted', async () => {
    const { result, blur, submit } = setup();

    await blur();
    expect(result.current.status).toBe('default');

    await submit();
    expect(result.current).toMatchObject({ status: 'error', errorMessage: 'Required' });
  });

  it('does not show a pristine default value as valid before the form is submitted', async () => {
    const { result, submit } = setup({
      billing_details: { address: { zip_code: '75008', country_code: 'FR' } },
    });

    expect(result.current.status).toBe('default');

    await submit();
    expect(result.current.status).toBe('success');
  });
});
