import { usePaymentConfirmation } from '@clubmed/caps/hooks/usePaymentConfirmation.js';
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
      <Loader isVisible />
    </Suspense>
  );
};
