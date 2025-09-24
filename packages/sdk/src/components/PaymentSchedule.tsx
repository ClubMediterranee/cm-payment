import {Card} from "@clubmed/trident-ui/molecules/Card";
import {Checkbox} from "@clubmed/trident-ui/molecules/Forms/Checkboxes";
import {useFormContext} from "react-hook-form";
import {usePaymentSchedule} from "../hooks/usePaymentSchedule";
import {useEffect} from "react";
import {TOKENS} from "@clubmed/payment-sdk/types/Tokens.js";

export const PaymentSchedule = () => {
  const {paymentSchedule} = usePaymentSchedule();
  const {register, setValue, watch} = useFormContext();
  const watchedAmount = watch("amount");

  useEffect(() => {
    setValue("amount", paymentSchedule[0]?.amount);
  }, [paymentSchedule, setValue]);

  return (
    <>
      {paymentSchedule.map((props) => {
        return (
          <Card title="" key={props.amount} icon={"Clipboard"}>
            <Checkbox
              value={props.amount}
              {...register("amount")}
              onChange={setValue}
              checked={props.amount === watchedAmount}
            >
              Je paie le montant de{" "}
              <span className="font-bold text-sienna mx-4">
                {props.amount} {props.currency}
              </span>
              {"deadline" in props ? ` avant le ${props.deadline}` : ""}
            </Checkbox>
          </Card>
        );
      })}
    </>
  );
}
PaymentSchedule.COMPONENT_KEY = TOKENS.PaymentSchedule
