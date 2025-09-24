import { Cgv } from '@clubmed/payment-sdk/components/Cgv';
import { PaymentSchedule } from '@clubmed/payment-sdk/components/PaymentSchedule';
import { IframeProvider } from '@clubmed/payment-sdk/components/providers/IframeProvider.js';
import { PaymentProvidersCheckboxes } from '@clubmed/payment-sdk/components/providers/PaymentProvidersCheckboxes.js';
import { useDisclosure } from '@clubmed/payment-sdk/hooks/useDisclosure';
import { SDKFormProvider } from '@clubmed/payment-sdk/providers/SDKFormProvider.js';
import { Button } from '@clubmed/trident-ui/molecules/Buttons/Button';
import classNames from 'classnames';
import { Suspense, useEffect, useRef, useState } from 'react';

import { Stay, StayPlaceholder } from '../components/Stay';
import { useStay } from '../hooks/useStay';
import { LoadingPage } from './LoadingPage.js';

export function PaymentPage() {
  const { isLoading, stay, status } = useStay();
  const { isOpen, onOpen: onLoad, onClose: onLoadEnd } = useDisclosure();

  const ref = useRef<HTMLParagraphElement | null>(null);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (error) {
      ref.current?.scrollIntoView();
    }
  }, [error]);

  if (isLoading || isOpen) {
    return <LoadingPage />;
  }

  if (status === 'error') {
    return (
      <div
        className={classNames(
          'flex flex-col gap-8 row-start-2 items-center mx-auto w-10/12 md:max-w-1/2',
        )}
      >
        <div>
          <h1 className="text-h3 w-full mb-8">Payment</h1>

          <p>Nous ne parvenons pas à récupérer les informations de votre séjour.</p>
          <p>Merci de réessayer ultérieurement.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'flex flex-col gap-8 row-start-2 items-center mx-auto w-10/12 md:max-w-1/2',
      )}
    >
      <h1 className="text-h3 w-full mb-8">Payment</h1>
      <Suspense fallback={<StayPlaceholder />}>
        <Stay stay={stay!} />
      </Suspense>

      <SDKFormProvider onError={setError} onLoad={onLoad} onLoadEnd={onLoadEnd}>
        <div className="w-full">
          <h2 className="text-h5 mb-16 font-serif">Choisissez l'échéancier de paiement</h2>
          <Suspense fallback={<div>loading</div>}>
            <PaymentSchedule />
          </Suspense>
        </div>
        <div className="w-full">
          <h2 className="text-h5 mb-16 font-serif">
            Quel moyen de paiement souhaitez-vous utiliser ?
          </h2>
          <Suspense fallback={<div>Loading</div>}>
            <PaymentProvidersCheckboxes />
          </Suspense>
        </div>
        <Cgv />
        <IframeProvider />
        {error?.message && (
          <p ref={ref} className="text-red font-semibold my-4">
            {error?.message}
          </p>
        )}
        <Button type="submit" className="my-8">
          Payer
        </Button>
      </SDKFormProvider>
    </div>
  );
}
