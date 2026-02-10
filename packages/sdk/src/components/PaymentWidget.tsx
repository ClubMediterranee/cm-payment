import { useEffect } from 'react';

import { useFormContext } from '../hooks/utils/useForm';
import { useProviderIntegrationMode } from '../hooks/utils/useProviderIntegrationMode';
import { TOKENS } from '../types/Tokens';
import { HostedFieldView } from './PaymentWidget/HostedFieldView';
import { IframeView } from './PaymentWidget/IframeView';
import { FormPanel } from './ui/FormPanel';
import { TextFieldSkeleton, TitleSkeleton } from './ui/skeletons';

export const PaymentWidget = () => {
  const { iframe, hostedField } = useProviderIntegrationMode();
  const { setValue } = useFormContext();

  useEffect(() => {
    if (!hostedField) {
      setValue('token.value', undefined);
    }
  }, [hostedField]);

  if (iframe) {
    return <IframeView />;
  }

  if (hostedField) {
    return <HostedFieldView />;
  }

  return null;
};

const PaymentWidgetSkeleton = () => (
  <div className="w-full">
    <TitleSkeleton variant="h5" />
    <FormPanel>
      <div className="flex flex-wrap gap-28">
        <TextFieldSkeleton />
        <TextFieldSkeleton />
        <div className="w-full flex flex-col md:flex-row gap-28">
          <TextFieldSkeleton />
          <TextFieldSkeleton />
        </div>
      </div>
    </FormPanel>
  </div>
);

PaymentWidget.Skeleton = PaymentWidgetSkeleton;
PaymentWidget.COMPONENT_KEY = TOKENS.PaymentWidget;
