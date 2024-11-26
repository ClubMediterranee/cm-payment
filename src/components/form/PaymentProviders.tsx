import { Card } from "@clubmed/trident-ui/molecules/Card";
import { Checkbox } from "@clubmed/trident-ui/molecules/Forms/Checkboxes";
import { AVAILABLE_ICONS } from "../../constants";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { usePaymentProviders } from "../../data/usePaymentProviders";
export const PaymentProviders = () => {
  const { data: paymentProviders = [], isSuccess } = usePaymentProviders();

  const { register, setValue, trigger, watch } = useFormContext();

  const watchedProviderId = watch("provider_id");

  useEffect(() => {
    if (isSuccess && paymentProviders.length > 0) {
      setValue("provider_id", paymentProviders[0]?.id, {
        shouldValidate: true,
      });
    }
  }, [isSuccess, paymentProviders, setValue]);

  return (
    <>
      {paymentProviders.map(({ category_payment_method, description, id }) => {
        return (
          <Card
            key={id}
            icon={AVAILABLE_ICONS[category_payment_method] || "Folder"}
            title={category_payment_method || description}
          >
            <div className="w-full">
              <Checkbox
                value={id}
                {...register("provider_id", {
                  required: "Vous devez choisir un moyen de paiement",
                })}
                checked={id === watchedProviderId}
                onChange={(name, value) => {
                  setValue(name, value ? id : undefined);
                  trigger(name);
                }}
              >
                {description}
              </Checkbox>
            </div>
          </Card>
        );
      })}
    </>
  );
};

export const PaymentProviderPlaceholder = () => {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} />
      ))}
    </>
  );
};
