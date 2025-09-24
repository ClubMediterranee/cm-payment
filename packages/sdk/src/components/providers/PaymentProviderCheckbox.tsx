import {Checkbox, type CheckboxProps} from "@clubmed/trident-ui/molecules/Forms/Checkboxes";
import type {PaymentProvider1} from "../../__generated__";
import {useIcon} from "@clubmed/trident-icons/hooks/useIcon";
import {Card} from "@clubmed/trident-ui/molecules/Card";
import type {IconicNames} from "@clubmed/trident-icons";

export function PaymentProviderCheckbox({provider, ...props}: CheckboxProps & { provider: PaymentProvider1 }) {
  const icon = useIcon(provider.category_payment_method, "")

  return (
    <Card
      key={provider.id}
      icon={icon ? provider.category_payment_method as IconicNames : "Folder"}
      title={provider.category_payment_method || provider.description || ""}
    >
      <div className="w-full">
        <Checkbox {...props} value={provider.id}>
          {provider.description}
        </Checkbox>
      </div>
    </Card>
  );
}
