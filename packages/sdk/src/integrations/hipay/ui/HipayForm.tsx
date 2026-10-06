import { useHipayHostedFields } from '../hooks/useHipayHostedFields.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { FormPanel } from '../../../components/ui/FormPanel.js';
import { HostedField } from '../../../components/ui/HostedField.js';
import integration from '../integration.config.js';

export const HipayForm = () => {
  const { content } = useCapsConfigContext();

  const { errors, isReady } = useHipayHostedFields({
    fieldSelectors: integration.mountPoints,
  });

  const fieldProps = { isLoading: !isReady };

  return (
    <FormPanel className="w-full">
      <div className="flex flex-wrap gap-28">
        <HostedField
          {...fieldProps}
          error={errors.cardNumber}
          label={content.creditCardForm.cardNumber}
          id={integration.mountPoints.cardNumber}
        />
        <HostedField
          {...fieldProps}
          error={errors.cardHolder}
          label={content.creditCardForm.fullName}
          id={integration.mountPoints.cardHolder}
        />

        <div className="w-full flex flex-col md:flex-row gap-28">
          <HostedField
            {...fieldProps}
            error={errors.expiryDate}
            label={content.creditCardForm.expiryDate}
            id={integration.mountPoints.expiryDate}
          />
          <HostedField
            {...fieldProps}
            error={errors.cvc}
            label={content.creditCardForm.cvc}
            id={integration.mountPoints.cvc}
          />
        </div>
      </div>
    </FormPanel>
  );
};
