import { Action, CapsPaymentForm, type CapsPaymentFormProps, useDisclosure } from '@clubmed/caps';
import classNames from 'classnames';
import { Suspense, useEffect, useRef, useState } from 'react';

import { Stay, StayPlaceholder } from '../components/Stay';
import { StayV2 } from '../components/StayV2';
import { useQueryParams } from '../hooks/useQueryParams';
import { useStay } from '../hooks/useStay';
import { useTheme } from '../hooks/useTheme';
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
  const theme = useTheme();
  const { isOpen: isPaymentLoading, onOpen: onLoad, onClose: onLoadEnd } = useDisclosure();

  const ref = useRef<HTMLParagraphElement | null>(null);
  const [error, setError] = useState<string>();
  const [donationSlot, setDonationSlot] = useState<HTMLElement | null>(null);

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

  const isLegacy = theme === 'legacy';

  const form = (
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
      opportunityId={values.opportunityId}
      action={action}
      reference={reference}
      uuid={uuid}
      theme={theme}
      stepper
      slots={isLegacy ? undefined : { donation: donationSlot }}
      onLoadingChange={(loading) => (loading ? onLoad() : onLoadEnd())}
      onError={onError}
    />
  );

  const errorMessage = error && (
    <p ref={ref} className="text-red font-semibold my-4 text-center">
      {error}
    </p>
  );

  if (isLegacy) {
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
        {form}
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="row-start-2 mx-auto w-10/12 md:max-w-1200">
      {isPaymentLoading && <LoadingPage />}
      <div className="mb-40 flex items-center gap-64 pt-40">
        <hr className="m-0 h-px flex-1 border-0 bg-black" />
        <h1 className="text-h3 font-serif font-bold italic">Payment</h1>
        <hr className="m-0 h-px flex-1 border-0 bg-black" />
      </div>
      <div className="grid grid-cols-1 gap-20 md:grid-cols-4 md:items-start">
        <aside className="md:order-2 md:sticky md:top-20">
          <Suspense fallback={<StayPlaceholder />}>
            <StayV2 stay={stay!} donationSlotRef={setDonationSlot} />
          </Suspense>
        </aside>

        <div className="flex flex-col gap-8 items-center md:order-1 md:col-span-3">
          {form}
          {errorMessage}
        </div>
      </div>
    </div>
  );
}
