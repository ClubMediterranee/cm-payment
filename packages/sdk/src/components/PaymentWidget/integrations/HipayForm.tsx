import { useHipayHostedFields } from '../../../hooks/integrations/hipay/useHipayHostedFields';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext';
import { PSP_MOUNT_POINTS } from '../../../utils/integrations/pspMountPoints';
import { FormPanel } from '../../ui/FormPanel';
import { HostedField } from '../../ui/HostedField';

const fieldSelectors = PSP_MOUNT_POINTS.hipay;

export const HipayForm = () => {
  const { content } = useCapsConfigContext();

  const { errors, isReady } = useHipayHostedFields({
    fieldSelectors,
  });

  const fieldProps = { isLoading: !isReady };

  return (
    <FormPanel className="w-full">
      <div className="flex flex-wrap gap-28">
        <HostedField
          {...fieldProps}
          error={errors.cardNumber}
          label={content.creditCardForm.cardNumber}
          id={fieldSelectors.cardNumber}
        />
        <HostedField
          {...fieldProps}
          error={errors.cardHolder}
          label={content.creditCardForm.fullName}
          id={fieldSelectors.cardHolder}
        />

        <div className="w-full flex flex-col md:flex-row gap-28">
          <HostedField
            {...fieldProps}
            error={errors.expiryDate}
            label={content.creditCardForm.expiryDate}
            id={fieldSelectors.expiryDate}
          />
          <HostedField
            {...fieldProps}
            error={errors.cvc}
            label={content.creditCardForm.cvc}
            id={fieldSelectors.cvc}
          />
        </div>
      </div>
    </FormPanel>
  );
};
