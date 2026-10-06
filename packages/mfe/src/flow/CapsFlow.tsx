import {
  Action,
  BillingAddress,
  type CapsFormSlots,
  CardInstallments,
  Cgv,
  Comments,
  ContactChoice,
  Donation,
  Form,
  PaymentProviders,
  PaymentSchedule,
  PaymentWidget,
  SubmitButton,
  useFormSubmit,
} from '@clubmed/caps';
import { type MouseEvent, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { ShadowSlot } from '../shadow/ShadowHost';

export const DEFAULT_FLOW_LABELS = {
  paymentSchedule: 'Choose your payment schedule',
  paymentProviders: 'Which payment method would you like to use?',
  cardInstallments: 'Choose your card installments',
  contactChoice: 'How would you like to be contacted?',
  donation: 'Make a donation',
  comments: 'Comments',
  cgv: 'Terms and conditions',
  billingAddress: 'Billing address',
  paymentWidget: 'Payment details',
  submit: 'Pay',
};

export type FlowLabels = typeof DEFAULT_FLOW_LABELS;

const Title = ({ children }: { children: string }) => (
  <h2 className="text-h5 mb-16 font-serif">{children}</h2>
);

/**
 * Errors while loading the flow data (action, schedules, providers…) are reported to the host.
 */
function FlowErrorFallback({
  error,
  resetErrorBoundary,
  onError,
}: {
  error: unknown;
  resetErrorBoundary: () => void;
  onError?: (error: Error) => void;
}) {
  const message = error instanceof Error ? error.message : String(error);

  useEffect(() => {
    onError?.(error instanceof Error ? error : new Error(message));
  }, [error]);

  return (
    <div className="p-40 text-center" role="alert">
      <h2 className="text-20 font-bold text-red mb-16">Impossible d'afficher le formulaire</h2>
      <p className="text-14 text-middleGrey mb-16">{message}</p>
      <button type="button" className="underline font-semibold" onClick={resetErrorBoundary}>
        Réessayer
      </button>
    </div>
  );
}

/**
 * Submit button rendered in a host slot. Its `form="payment-form"` attribute cannot reach the form across
 * shadow roots, so the click submits the form explicitly.
 */
export function SubmitSlot({ target, children }: { target?: HTMLElement; children: ReactNode }) {
  const { onSubmit } = useFormSubmit();

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      'button[type="submit"]',
    );

    if (button && !button.form) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <ShadowSlot target={target}>
      <div className="flex flex-col" onClickCapture={onClickCapture}>
        {children}
      </div>
    </ShadowSlot>
  );
}

type CapsFlowProps = {
  labels?: Partial<FlowLabels>;
  /**
   * Host elements where the donation and the submit button are rendered instead of inside the form.
   */
  slots?: CapsFormSlots;
  action?: string;
  reference?: string;
  uuid?: string;
  onReady?: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onError?: (error: Error) => void;
};

/**
 * Composition of the CAPS payment steps. Components not enabled for the issuer render nothing.
 */
export function CapsFlow({
  labels: labelOverrides,
  slots,
  action,
  reference,
  uuid,
  onReady,
  onLoadingChange,
  onError,
}: CapsFlowProps) {
  const labels = { ...DEFAULT_FLOW_LABELS, ...labelOverrides };
  const [error, setError] = useState<Error>();
  const errorRef = useRef<HTMLParagraphElement>(null);
  const onLoadingChangeRef = useRef(onLoadingChange);
  onLoadingChangeRef.current = onLoadingChange;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const onLoad = useCallback(() => onLoadingChangeRef.current?.(true), []);
  const onLoadEnd = useCallback(() => onLoadingChangeRef.current?.(false), []);

  useEffect(() => {
    onReady?.();
    // Called once, when the flow is mounted.
  }, []);

  useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({ block: 'center' });
    }
  }, [error]);

  const handleError = useCallback((err: Error) => {
    setError(err);
    onLoadingChangeRef.current?.(false);
    onErrorRef.current?.(err);
  }, []);

  return (
    <Form
      action={action as Action | undefined}
      errorFallback={(props) => <FlowErrorFallback {...props} onError={onErrorRef.current} />}
      onError={handleError}
      onLoad={onLoad}
      onLoadEnd={onLoadEnd}
    >
      <PaymentSchedule>
        <Title>{labels.paymentSchedule}</Title>
      </PaymentSchedule>
      <PaymentProviders>
        <Title>{labels.paymentProviders}</Title>
      </PaymentProviders>
      <CardInstallments>
        <Title>{labels.cardInstallments}</Title>
      </CardInstallments>
      <ContactChoice reference={reference} uuid={uuid}>
        <Title>{labels.contactChoice}</Title>
      </ContactChoice>
      <ShadowSlot target={slots?.donation}>
        <Donation>
          <Title>{labels.donation}</Title>
        </Donation>
      </ShadowSlot>
      <Comments>
        <Title>{labels.comments}</Title>
      </Comments>
      <Cgv>
        <Title>{labels.cgv}</Title>
      </Cgv>
      <BillingAddress>
        <Title>{labels.billingAddress}</Title>
      </BillingAddress>
      <PaymentWidget>
        <Title>{labels.paymentWidget}</Title>
      </PaymentWidget>
      {error?.message && (
        <p ref={errorRef} className="text-red font-semibold my-4 text-center">
          {error.message}
        </p>
      )}
      <SubmitSlot target={slots?.submit}>
        <SubmitButton className={slots?.submit ? 'w-full' : 'my-8 self-center'}>
          {labels.submit}
        </SubmitButton>
      </SubmitSlot>
    </Form>
  );
}
