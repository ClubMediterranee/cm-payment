import {
  Action,
  type CapsEvent,
  CapsPaymentForm,
  type CapsPaymentFormProps,
  useDisclosure,
} from '@clubmed/caps';
import classNames from 'classnames';
import { Suspense, useEffect, useRef, useState } from 'react';

import { Stay, StayPlaceholder } from '../components/Stay';
import { StayV2 } from '../components/StayV2';
import { useContent } from '../hooks/useContent';
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
  const { app, content } = useContent();
  const { isOpen: isPaymentLoading, onOpen: onLoad, onClose: onLoadEnd } = useDisclosure();

  const ref = useRef<HTMLParagraphElement | null>(null);
  const [error, setError] = useState<string>();
  const [donationSlot, setDonationSlot] = useState<HTMLElement | null>(null);

  const onEvent = (event: CapsEvent) => {
    if (event.name === 'load') {
      onLoad();
    }
    if (event.name === 'load_end') {
      onLoadEnd();
    }
    if (event.name === 'error') {
      setError(event.data.message);
      onLoadEnd();
    }
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
          <h1 className="text-h3 w-full mb-8">{app.payment.title}</h1>

          <p>{app.payment.stayUnavailable}</p>
          <p>{app.payment.retryLater}</p>
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
      sellerEmail={values.sellerEmail}
      action={action}
      reference={reference}
      uuid={uuid}
      theme={theme}
      content={content}
      slots={isLegacy ? undefined : { donation: donationSlot }}
      onEvent={onEvent}
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
        <h1 className="text-h3 w-full mb-8">{app.payment.title}</h1>
        <Suspense fallback={<StayPlaceholder />}>
          <Stay stay={stay!} />
        </Suspense>
        {form}
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="row-start-2 w-full px-20 pt-40">
      {isPaymentLoading && <LoadingPage />}
      <div className="mx-auto flex w-full max-w-1180 flex-col gap-20 md:flex-row md:items-start">
        <aside className="md:order-2 md:sticky md:top-20 md:w-380 md:shrink-0">
          <Suspense fallback={<StayPlaceholder />}>
            <StayV2 stay={stay!} donationSlotRef={setDonationSlot} />
          </Suspense>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-20 md:order-1 md:max-w-780 md:gap-40">
          <div className="flex items-center gap-12 md:gap-20">
            <div aria-hidden="true" className="h-1 flex-1 bg-black" />
            <h2 className="text-center font-serif text-h4 font-bold italic text-black md:text-h1">
              {app.payment.title}
            </h2>
            <div aria-hidden="true" className="h-1 flex-1 bg-black" />
          </div>
          <div className="flex flex-col items-center gap-8">
            {form}
            {errorMessage}
          </div>
        </section>
      </div>
    </div>
  );
}
