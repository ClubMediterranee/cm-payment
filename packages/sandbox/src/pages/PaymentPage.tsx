import { Suspense, useEffect, useRef, useState } from "react";
import { Stay, StayPlaceholder } from "../components/Stay";
import { useAppContext } from "../hooks/useAppContext";
import { useStay } from "../data/useStay";
import classNames from "classnames";
import { Cgv, FormProvider, IframeProvider, PaymentProviders, PaymentSchedule } from '@cm-payment/sdk/src';
import { Button } from "@clubmed/trident-ui/molecules/Buttons/Button";
import { getParams } from "../utils/router";
import { useUserId } from "../hooks/useUserId";
import { useDisclosure } from "@cm-payment/sdk/src/hooks/useDisclosure";
import { Loader } from "@clubmed/trident-ui/molecules/Loader";

export function PaymentPage() {
  const {  id, type } = useAppContext();
  const { issuer } = getParams();
  const { stay } = useStay();
  const userId = useUserId();
  const ref = useRef<HTMLParagraphElement | null>(null);
  const { isOpen: isLoading, onOpen: onLoad, onClose: onLoadEnd } = useDisclosure();
  const [error, setError ] = useState<Error>();

  useEffect(() => {
    if (error) {
      ref.current?.scrollIntoView();
    }
  }, [error]);
  

  if(isLoading) {
    return ( 
    <Suspense fallback={null}>
        <Loader
            isVisible
            label="This is like elevator music but for your eyes. Please wait while we load your content."
        />
      </Suspense>)
  }

  return (
    <div
      className={classNames(
        "flex flex-col gap-8 row-start-2 items-center mx-auto w-10/12 md:max-w-1/2",
      )}
    >
        <h1 className="text-h3 w-full mb-8">Payment</h1>
          <Suspense fallback={<StayPlaceholder />}>
            <Stay stay={stay} />
          </Suspense>
      <FormProvider id={id} type={type} status={stay.booking_status} issuer={issuer} customerId={userId} callbackUrl={`${import.meta.env.VITE_DOMAIN}/confirmation`} onLoad={onLoad} onLoadEnd={onLoadEnd} onError={setError}>
        <div className="w-full">
          <h2 className="text-h5 mb-16 font-serif">
            Choisissez l'échéancier de paiement
          </h2>
          <Suspense fallback={<div>loading</div>}>
            <PaymentSchedule />
          </Suspense>
        </div>
        <div className="w-full">
          <h2 className="text-h5 mb-16 font-serif">
            Quel moyen de paiement souhaitez-vous utiliser ?
          </h2>
          <Suspense fallback={<div>loadign</div>}>
            <PaymentProviders />
          </Suspense>
        </div>
        <Cgv />
        <IframeProvider />
        {error?.message && <p ref={ref} className="text-red font-semibold my-4" >{error?.message}</p>}
        <Button type="submit" className="my-8">
          Payer
        </Button>
      </FormProvider>
    </div>
  );
}
