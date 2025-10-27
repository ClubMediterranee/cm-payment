import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Checkbox } from '@clubmed/trident-ui/molecules/Forms/Checkboxes';

import { useFormContext } from '../hooks/utils/useForm';
import { useSDKConfig } from '../providers/SDKConfigProvider';
import { SDKFormData } from '../types/FormData';
import { FormPanel } from './ui/FormPanel';

export const Cgv = () => {
  const { content } = useSDKConfig();
  const { register, setValue, trigger } = useFormContext();

  return (
    <div>
      <h2 className="text-h5 mb-16 font-serif">{content.cgv.title}</h2>
      <FormPanel>
        <Checkbox
          {...register('cgv', {
            required: content.cgv.validation.required,
            validate: (value) => value === true || content.cgv.validation.mustAccept,
          })}
          onChange={(name, value) => {
            setValue(name as keyof SDKFormData, value);
            trigger(name as keyof SDKFormData);
          }}
          required
        >
          <span className="text-b4 font-bold">{content.cgv.content}</span>
        </Checkbox>
      </FormPanel>
    </div>
  );
};

Cgv.COMPONENT_KEY = TOKENS.Cgv;
