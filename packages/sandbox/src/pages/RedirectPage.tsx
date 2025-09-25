import { usePaymentConfirmation } from '@clubmed/payment-sdk/hooks/usePaymentConfirmation.js';
import { lazy, Suspense } from 'react';
import { useParams } from 'wouter';

const Loader = lazy(async () => ({
  default: (await import('@clubmed/trident-ui/molecules/Loader')).Loader,
}));

export const RedirectPage = () => {
  const { paymentId = '' } = useParams<{ paymentId?: string }>();

  usePaymentConfirmation({ paymentId });

  return (
    <Suspense fallback={null}>
      <Loader
        isVisible
        label="This is like elevator music but for your eyes. Please wait while we load your content."
      />
    </Suspense>
  );
};
