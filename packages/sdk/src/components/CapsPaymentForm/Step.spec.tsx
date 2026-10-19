import { zodResolver } from '@hookform/resolvers/zod';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import * as z from 'zod';

import { StepperContext } from '../../contexts/StepperContext';
import { Step } from './Step';

const schema = z.object({
  amount: z.string(),
  provider_id: z.string(),
  cgv: z.boolean().refine((value) => value),
});

type Values = z.infer<typeof schema>;

const Harness = ({
  defaultValues,
  stepper = true,
}: {
  defaultValues: Values;
  stepper?: boolean;
}) => {
  const methods = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  return (
    <FormProvider {...methods}>
      <StepperContext.Provider value={stepper}>
        <button
          type="button"
          onClick={() => methods.setValue('cgv', false, { shouldValidate: true })}
        >
          refuse
        </button>
        <Step name="providers">
          <span>providers</span>
        </Step>
        <Step name="details">
          <span>details</span>
        </Step>
        <Step name="submit">
          <span>submit</span>
        </Step>
      </StepperContext.Provider>
    </FormProvider>
  );
};

const visible = () =>
  ['providers', 'details', 'submit'].filter((name) => screen.queryByText(name) !== null);

describe('Step', () => {
  it('always shows its content without the stepper', () => {
    render(<Harness stepper={false} defaultValues={{ amount: '', provider_id: '', cgv: false }} />);

    expect(visible()).toEqual(['providers', 'details', 'submit']);
  });

  it('shows nothing until a schedule is selected', () => {
    render(<Harness defaultValues={{ amount: '', provider_id: '', cgv: false }} />);

    expect(visible()).toEqual([]);
  });

  it('shows the payment methods once the amount is set', () => {
    render(<Harness defaultValues={{ amount: '3000', provider_id: '', cgv: false }} />);

    expect(visible()).toEqual(['providers']);
  });

  it('shows the details once a provider is selected', () => {
    render(<Harness defaultValues={{ amount: '3000', provider_id: 'card', cgv: false }} />);

    expect(visible()).toEqual(['providers', 'details']);
  });

  it('shows the submit while the form is valid and hides it when it is not', async () => {
    render(<Harness defaultValues={{ amount: '3000', provider_id: 'card', cgv: true }} />);

    expect(await screen.findByText('submit')).toBeTruthy();

    fireEvent.click(screen.getByText('refuse'));

    await vi.waitFor(() => expect(screen.queryByText('submit')).toBeNull());
    expect(visible()).toEqual(['providers', 'details']);
  });
});
