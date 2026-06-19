import {
  Action,
  BillingAddress,
  CardInstallments,
  Cgv,
  ContactChoice,
  Donation,
  Form,
  PaymentProviders,
  PaymentSchedule,
  PaymentWidget,
  SubmitButton,
  useDisclosure,
} from '@clubmed/caps';
import classNames from 'classnames';
import { Suspense, useEffect, useRef, useState } from 'react';

import { Stay, StayPlaceholder } from '../components/Stay';
import { useQueryParams } from '../hooks/useQueryParams';
import { useStay } from '../hooks/useStay';
import { LoadingPage } from './LoadingPage';

export function PaymentPage() {
  const { stay, status } = useStay();
  const { action, reference, uuid } = useQueryParams<{
    action?: Action;
    reference?: string;
    uuid?: string;
  }>();
  const { isOpen: isPaymentLoading, onOpen: onLoad, onClose: onLoadEnd } = useDisclosure();

  const ref = useRef<HTMLParagraphElement | null>(null);
  const [error, setError] = useState<Error>();

  const onError = (error: Error) => {
    setError(error);
    onLoadEnd();
  };

  useEffect(() => {
    if (error) {
      ref.current?.scrollIntoView();
    }
  }, [error]);

  if (status === 'error') {
    return (
      <div
        className={classNames(
          'flex flex-col gap-8 row-start-2 items-center mx-auto w-10/12 md:max-w-[49rem]',
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
        'flex flex-col gap-8 row-start-2 items-center mx-auto w-10/12 md:max-w-[49rem]',
      )}
    >
      {isPaymentLoading && <LoadingPage />}
      <h1 className="text-h3 w-full mb-8">Payment</h1>
      <Suspense fallback={<StayPlaceholder />}>
        <Stay stay={stay!} />
      </Suspense>

      <Form onError={onError} onLoad={onLoad} onLoadEnd={onLoadEnd} action={action}>
        <div className="w-full">
          <h2 className="text-h5 mb-16 font-serif">Choisissez l'échéancier de paiement</h2>
          <PaymentSchedule />
        </div>
        <div className="w-full">
          <h2 className="text-h5 mb-16 font-serif">
            Quel moyen de paiement souhaitez-vous utiliser ?
          </h2>
          <PaymentProviders />
        </div>
        <CardInstallments />
        <ContactChoice reference={reference} uuid={uuid} />
        <Donation />
        <Cgv />
        <BillingAddress />
        <PaymentWidget />
        {error?.message && (
          <p ref={ref} className="text-red font-semibold my-4">
            {error?.message}
          </p>
        )}
        <SubmitButton className="my-8">Payer</SubmitButton>
      </Form>
    </div>
  );
}
