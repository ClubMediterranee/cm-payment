import { Card } from "@clubmed/trident-ui/molecules/Card";
import { Checkbox } from "@clubmed/trident-ui/molecules/Forms/Checkboxes";
import { useFormContext } from "react-hook-form";
import { usePaymentSchedule } from "../hooks/usePaymentSchedule";
import { useEffect } from "react";
import { Component_Key } from "../utils/constants";

export const PaymentSchedule = () => {
  const { paymentSchedule } = usePaymentSchedule();
  const { register, setValue, watch } = useFormContext();
  const watchedAmount = watch("amount");

  useEffect(() => {
    setValue("amount", paymentSchedule[0]?.amount);
  }, [paymentSchedule, setValue]);

  return (
    <>
      {paymentSchedule.map(({ amount, currency, deadline }) => {
        return (
          <Card title="" key={amount} icon={"Clipboard"}>
            <Checkbox
              value={amount}
              {...register("amount")}
              onChange={setValue}
              checked={amount === watchedAmount}
            >
              Je paie le montant de{" "}
              <span className="font-bold text-sienna mx-4">
                {amount} {currency}
              </span>
              {deadline ? ` avant le ${deadline}` : ""}
            </Checkbox>
          </Card>
        );
      })}
    </>
  );
}
PaymentSchedule.COMPONENT_KEY = Component_Key.PaymentSchedule

export const PaymentSchedulePlaceholder = () => {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} />
      ))}
    </>
  );
};
