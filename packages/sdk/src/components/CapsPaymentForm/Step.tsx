import type { PropsWithChildren } from 'react';

import { useStepper } from '../../contexts/StepperContext';
import { useFormContext, useWatch } from '../../hooks/utils/useForm';

export type StepName = 'providers' | 'details' | 'submit';

type StepProps = PropsWithChildren<{ name: StepName }>;

const useStepVisibility = (name: StepName) => {
  const amount = useWatch('amount');
  const providerId = useWatch('provider_id');
  const { formState } = useFormContext();
  const isValid = formState.isValid;

  const hasSchedule = Number(amount) > 0;

  const visibility: Record<StepName, boolean> = {
    providers: hasSchedule,
    details: hasSchedule && !!providerId,
    submit: hasSchedule && !!providerId && isValid,
  };

  return visibility[name];
};

const GatedStep = ({ name, children }: StepProps) =>
  useStepVisibility(name) ? <>{children}</> : null;

export const Step = ({ name, children }: StepProps) =>
  useStepper() ? <GatedStep name={name}>{children}</GatedStep> : <>{children}</>;
