import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import * as z from 'zod';

import { FormSchemaContext } from '../../contexts/FormSchemaContext';
import { Step } from './Step';

const schema = z.object({
  amount: z.string().min(1),
  provider_id: z.string().min(1),
  billing_details: z.object({
    address: z.object({ city: z.string().min(1) }),
    attendee: z.object({ first_name: z.string().min(1) }),
  }),
  cgv: z.boolean().refine((value) => value),
  donation_amount: z.number().nonnegative().optional(),
});

type Values = z.infer<typeof schema>;

const valid: Values = {
  amount: '3000',
  provider_id: 'card',
  billing_details: { address: { city: 'Paris' }, attendee: { first_name: 'Ada' } },
  cgv: true,
};

const Harness = ({ values = {} }: { values?: Partial<Values> }) => {
  const methods = useForm<Values>({ defaultValues: { ...valid, ...values } });

  return (
    <FormSchemaContext.Provider value={schema as never}>
      <FormProvider {...methods}>
        <button type="button" onClick={() => methods.setValue('amount', '')}>
          reset amount
        </button>
        <button type="button" onClick={() => methods.setValue('donation_amount', -1)}>
          invalid donation
        </button>
        <Step after="amount">
          <span>providers</span>
        </Step>
        <Step after="provider_id">
          <span>billing</span>
        </Step>
        <Step after={['billing_details.attendee', 'billing_details.address']}>
          <span>cgv</span>
        </Step>
        <Step>
          <span>submit</span>
        </Step>
      </FormProvider>
    </FormSchemaContext.Provider>
  );
};

const visible = () =>
  ['providers', 'billing', 'cgv', 'submit'].filter((name) => screen.queryByText(name));

describe('Step', () => {
  it('always shows its content without a form schema', () => {
    const methods = { amount: '', provider_id: '', cgv: false };

    const Bare = () => {
      const form = useForm<Values>({ defaultValues: { ...valid, ...methods } });

      return (
        <FormProvider {...form}>
          <Step after="amount">
            <span>providers</span>
          </Step>
        </FormProvider>
      );
    };

    render(<Bare />);

    expect(screen.queryByText('providers')).not.toBeNull();
  });

  it('shows nothing while the first field is invalid', () => {
    render(<Harness values={{ amount: '' }} />);

    expect(visible()).toEqual([]);
  });

  it('shows a step once the field it follows and every field before it are valid', () => {
    render(<Harness values={{ provider_id: '' }} />);

    expect(visible()).toEqual(['providers']);
  });

  it('waits for every field of the list', () => {
    render(
      <Harness
        values={{ billing_details: { address: { city: '' }, attendee: { first_name: 'Ada' } } }}
      />,
    );

    expect(visible()).toEqual(['providers', 'billing']);
  });

  it('shows every step when the whole form is valid', () => {
    render(<Harness />);

    expect(visible()).toEqual(['providers', 'billing', 'cgv', 'submit']);
  });

  it('hides the steps again when a previous field becomes invalid', async () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('reset amount'));

    await vi.waitFor(() => expect(visible()).toEqual([]));
  });

  it('keeps the step without `after` hidden while any other field is invalid', async () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('invalid donation'));

    await vi.waitFor(() => expect(screen.queryByText('submit')).toBeNull());
    expect(visible()).toEqual(['providers', 'billing', 'cgv']);
  });
});
