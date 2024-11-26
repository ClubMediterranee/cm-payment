import { Suspense } from "react";
import { Cgv } from "../components/form/Cgv";
import { Form } from "../components/form/Form";
import {
  PaymentProviderPlaceholder,
  PaymentProviders,
} from "../components/form/PaymentProviders";
import { Stay, StayPlaceholder } from "../components/Stay";
import { useAppContext } from "../hooks/useAppContext";
import { PaymentSchedule } from "../components/form/PaymentSchedule";
import { useStay } from "../data/useStay";
import classNames from "classnames";

export function PaymentPage() {
  const { isIframe } = useAppContext();
  const { stay } = useStay();
  const isStandalone = !isIframe;

  return (
    <div
      className={classNames(
        "flex flex-col gap-8 row-start-2 items-center mx-auto",
        { "max-w-1/2": isStandalone }
      )}
    >
      {isStandalone && (
        <>
          <h1 className="text-h3 w-full mb-8">Payment</h1>
          <Suspense fallback={<StayPlaceholder />}>
            <Stay stay={stay} />
          </Suspense>
        </>
      )}
      <Form>
        <div className="w-full">
          <h2 className="text-h3 mb-16 font-serif">Quel echeancier ?</h2>
          <Suspense fallback={<PaymentProviderPlaceholder />}>
            <PaymentSchedule />
          </Suspense>
        </div>
        <div className="w-full">
          <h2 className="text-h3 mb-16 font-serif">Quel moyen de paiement ?</h2>
          <Suspense fallback={<PaymentProviderPlaceholder />}>
            <PaymentProviders />
          </Suspense>
        </div>
        <Cgv />
      </Form>
    </div>
  );
}
