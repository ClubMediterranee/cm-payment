import {TOKENS} from "@clubmed/payment-sdk/types/Tokens.js";
import {PaymentProviderCheckbox} from "@clubmed/payment-sdk/components/providers/PaymentProviderCheckbox.js";
import {
  usePaymentProvidersCheckboxes
} from "@clubmed/payment-sdk/components/providers/usePaymentProvidersCheckboxes.js";

export const PaymentProvidersCheckboxes = () => {
  const {paymentProviders, register, setValue, trigger, watchedProviderId} = usePaymentProvidersCheckboxes();

  return (
    <>
      {paymentProviders.map((provider) => {
        return <PaymentProviderCheckbox
          key={provider.id}
          provider={provider}
          {...register("provider_id", {
            required: "Vous devez choisir un moyen de paiement",
          })}
          checked={provider.id === watchedProviderId}
          onChange={(name, value) => {
            setValue(name, value ? provider.id : undefined);
            trigger(name);
          }}
        />
      })}
    </>
  );
};

PaymentProvidersCheckboxes.COMPONENT_KEY = TOKENS.PaymentProviders
