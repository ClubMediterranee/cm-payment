import { Action, CapsPaymentForm, type CapsPaymentFormProps, useDisclosure } from '@clubmed/caps';
import classNames from 'classnames';
import { Suspense, useEffect, useRef, useState } from 'react';

import { Stay, StayPlaceholder } from '../components/Stay';
import { useQueryParams } from '../hooks/useQueryParams';
import { useStay } from '../hooks/useStay';
import { useAppContext } from '../providers/AppProvider';
import { LoadingPage } from './LoadingPage';

export function PaymentPage() {
  const { stay, status } = useStay();
  const { api, id, type, values, oidc } = useAppContext();
  const { action, reference, uuid } = useQueryParams<{
    action?: Action;
    reference?: string;
    uuid?: string;
  }>();
  const { isOpen: isPaymentLoading, onOpen: onLoad, onClose: onLoadEnd } = useDisclosure();

  const ref = useRef<HTMLParagraphElement | null>(null);
  const [error, setError] = useState<string>();

  const onError = ({ message }: { message: string }) => {
    setError(message);
    onLoadEnd();
  };

  useEffect(() => {
    if (error) {
      ref.current?.scrollIntoView();
    }
  }, [error]);

  useEffect(() => {
    const handlePageShow = () => {
      onLoadEnd();
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [onLoadEnd]);

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

      <CapsPaymentForm
        capsUrl={api.url}
        apiKey={api.apiKey}
        issuerType={oidc.issuerType as CapsPaymentFormProps['issuerType']}
        type={type}
        id={id!}
        customerId={values.customerId}
        locale={values.locale}
        accessToken={oidc.accessToken}
        callbackUrl={values.callbackUrl}
        callbackUrlSeller={values.callbackUrlSeller}
        salesNetworkId={values.salesNetworkId}
        salesmanId={values.salesmanId}
        action={action}
        reference={reference}
        uuid={uuid}
        theme="legacy"
        onLoadingChange={(loading) => (loading ? onLoad() : onLoadEnd())}
        onError={onError}
      />
      {error && (
        <p ref={ref} className="text-red font-semibold my-4 text-center">
          {error}
        </p>
      )}
    </div>
  );
}
