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
        <PaymentSchedule>
          <h2 className="text-h5 mb-16 font-serif">Choisissez l'échéancier de paiement</h2>
        </PaymentSchedule>
        <PaymentProviders>
          <h2 className="text-h5 mb-16 font-serif">
            Quel moyen de paiement souhaitez-vous utiliser ?
          </h2>
        </PaymentProviders>
        <CardInstallments>
          <h2 className="text-h5 mb-16 font-serif">Choisissez votre échéancier de carte</h2>
        </CardInstallments>
        <ContactChoice reference={reference} uuid={uuid}>
          <h2 className="text-h5 mb-16 font-serif">Comment souhaitez-vous être contacté ?</h2>
        </ContactChoice>
        <Donation>
          <h2 className="text-h5 mb-16 font-serif">Faites un don</h2>
        </Donation>
        <Comments>
          <h2 className="text-h5 mb-16 font-serif">Fill your comments</h2>
        </Comments>
        <Cgv>
          <h2 className="text-h5 mb-16 font-serif">Conditions générales de vente</h2>
        </Cgv>
        <BillingAddress>
          <h2 className="text-h5 mb-16 font-serif">Adresse de facturation</h2>
        </BillingAddress>
        <PaymentWidget>
          <h2 className="text-h5 mb-16 font-serif">Informations de paiement</h2>
        </PaymentWidget>
        {error?.message && (
          <p ref={ref} className="text-red font-semibold my-4 text-center">
            {error?.message}
          </p>
        )}
        <SubmitButton className="my-8 self-center">Payer</SubmitButton>
      </Form>
    </div>
  );
}
