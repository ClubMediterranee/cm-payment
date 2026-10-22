import type { PropsWithChildren } from 'react';
import { useWatch } from 'react-hook-form';

import { useFormSchema } from '../../contexts/FormSchemaContext';
import { useStepper } from '../../contexts/StepperContext';

const FIELD_ORDER = [
  'amount',
  'provider_id',
  'payment_condition_id',
  'billing_details.attendee',
  'billing_details.address',
  'creditCard',
  'token',
  'template_id',
  'billing_details.mobile_phone',
  'billing_details.email',
  'comments',
  'cgv',
] as const;

export type StepField = (typeof FIELD_ORDER)[number];

const rankOf = (path: string) => {
  const rank = FIELD_ORDER.findIndex((field) => `${path}.`.startsWith(`${field}.`));

  return rank < 0 ? FIELD_ORDER.length : rank;
};

type StepProps = PropsWithChildren<{ after?: StepField | StepField[] }>;

export const Step = ({ after, children }: StepProps) => {
  const stepper = useStepper();
  const schema = useFormSchema();
  const values = useWatch();

  if (!stepper) return <>{children}</>;

  const issues = schema?.safeParse(values).error?.issues ?? [];
  const firstInvalid = Math.min(...issues.map(({ path }) => rankOf(path.join('.'))), Infinity);
  const last = after
    ? Math.max(...[after].flat().map((field) => FIELD_ORDER.indexOf(field)))
    : FIELD_ORDER.length;

  return firstInvalid > last ? <>{children}</> : null;
};
