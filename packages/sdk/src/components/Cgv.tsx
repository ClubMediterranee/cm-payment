import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Checkbox } from '@clubmed/trident-ui/molecules/Forms/Checkboxes';

import { useFormContext } from '../hooks/utils/useForm';
import { SDKFormData } from '../types/FormData';
import { FormPanel } from './ui/FormPanel';

export const Cgv = () => {
  const { register, setValue, trigger } = useFormContext();

  return (
    <div>
      <h2 className="text-h5 mb-16 font-serif">Conditions Générales de Vente</h2>
      <FormPanel>
        <Checkbox
          {...register('cgv', {
            required: 'Vous devez accepter les conditions générales de vente',
            validate: (value) => value === true || 'Vous devez accepter les CGV',
          })}
          onChange={(name, value) => {
            setValue(name as keyof SDKFormData, value);
            trigger(name as keyof SDKFormData);
          }}
          required
        >
          La validation de ma réservation implique une obligation de paiement. [FBL] §§ Je suis
          informé(e) de l’obligation de présenter le résultat d’un test négatif ou une attestation
          de vaccination complète à la Covid-19 pour accéder au Resort entre le 21 mai et le 30
          septembre 2021 (détails sur la page du Resort). J'accepte les Conditions Générales de
          Vente et déclare avoir pris également connaissance du Formulaire d’information.*
        </Checkbox>
      </FormPanel>
    </div>
  );
};

Cgv.COMPONENT_KEY = TOKENS.Cgv;
