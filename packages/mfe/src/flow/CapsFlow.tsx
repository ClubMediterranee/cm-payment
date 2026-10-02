import {
  Action,
  BillingAddress,
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
} from '@clubmed/caps';
import { useEffect, useRef, useState } from 'react';

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

type CapsFlowProps = {
  labels?: Partial<FlowLabels>;
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

  useEffect(() => {
    onReady?.();
    // Called once, when the flow is mounted.
  }, []);

  useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({ block: 'center' });
    }
  }, [error]);

  const handleError = (err: Error) => {
    setError(err);
    onLoadingChange?.(false);
    onError?.(err);
  };

  return (
    <Form
      action={action as Action | undefined}
      errorFallback={(props) => <FlowErrorFallback {...props} onError={onError} />}
      onError={handleError}
      onLoad={() => onLoadingChange?.(true)}
      onLoadEnd={() => onLoadingChange?.(false)}
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
      <Donation>
        <Title>{labels.donation}</Title>
      </Donation>
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
      <SubmitButton className="my-8 self-center">{labels.submit}</SubmitButton>
    </Form>
  );
}
