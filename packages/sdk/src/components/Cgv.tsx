import {Card} from "@clubmed/trident-ui/molecules/Card";
import {Checkbox} from "@clubmed/trident-ui/molecules/Forms/Checkboxes";
import {useFormContext} from "react-hook-form";
import {TOKENS} from "@clubmed/payment-sdk/types/Tokens.js";

export const Cgv = () => {
  const {register, setValue, trigger} = useFormContext();

  return (
    <div>
      <h2 className="text-h5 mb-16 font-serif">
        Conditions Générales de Vente
      </h2>
      <Card icon="Edit" title={"Conditions Générales de Vente Modifiées 2"}>
        <Checkbox
          {...register("cgv", {
            required: "Vous devez accepter les conditions générales de vente",
            validate: (value) =>
              value === true || "Vous devez accepter les CGV",
          })}
          onChange={(name, value) => {
            setValue(name, value);
            trigger(name);
          }}
          required
        >
          La validation de ma réservation implique une obligation de paiement.
          [FBL] §§ Je suis informé(e) de l’obligation de présenter le résultat
          d’un test négatif ou une attestation de vaccination complète à la
          Covid-19 pour accéder au Resort entre le 21 mai et le 30 septembre
          2021 (détails sur la page du Resort). J'accepte les Conditions
          Générales de Vente et déclare avoir pris également connaissance du
          Formulaire d’information.*
        </Checkbox>
      </Card>
    </div>
  );
};

Cgv.COMPONENT_KEY = TOKENS.Cgv;
