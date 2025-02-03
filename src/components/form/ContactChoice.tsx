import { Card } from "@clubmed/trident-ui/molecules/Card";
import { Checkbox } from "@clubmed/trident-ui/molecules/Forms/Checkboxes";
import { useFormContext } from "react-hook-form";
import { Icon } from "@clubmed/trident-ui/atoms/Icons";
import { TextField } from "@clubmed/trident-ui/molecules/Forms/TextField";
import { WITH_CONTACT_METHODS_PROVIDERS } from "../../utils/constants";

const CONTACT_CHOICE = [
  {
    id: "6",
    name: "email",
    label: "Email",
    type: "email",
    icon: "Letter",
  },
  {
    id: "8",
    name: "mobile_phone",
    label: "Téléphone",
    type: "phone",
    icon: "Phone",
  },
];

export const ContactChoice = () => {
  const { register, setValue, watch } = useFormContext();
  const watchedTemplateId = watch("template_id");
  const watchedProviderId = watch("provider_id");

  const displayContactChoice = WITH_CONTACT_METHODS_PROVIDERS.find((id) =>
    watchedProviderId?.includes(id)
  );

  if (!displayContactChoice) {
    return null;
  }

  return (
    <div className="w-full">
      <h2 className="text-h3 mb-16 font-serif">Quel type de canal ?</h2>
      {CONTACT_CHOICE.map(({ id, name, type, icon, label }) => {
        const isChecked = id === watchedTemplateId;
        return (
          <Card title="" key={id} icon={icon as keyof typeof Icon}>
            <Checkbox
              value={id}
              className="mb-12"
              {...register("template_id")}
              onChange={setValue}
              checked={isChecked}
            >
              Par {label}
            </Checkbox>
            {isChecked && (
              <TextField
                type={type}
                {...register(`billing_details.${name}`)}
                onChange={setValue}
                label={label}
              />
            )}
          </Card>
        );
      })}
    </div>
  );
};
