import { PropsWithChildren, useEffect } from 'react';

import { useFormContext } from '../hooks/utils/useForm';
import { useProviderIntegrationMode } from '../hooks/utils/useProviderIntegrationMode';
import { TOKENS } from '../types/Tokens';
import { IframeView } from './PaymentWidget/IframeView';
import { IntegratedView } from './PaymentWidget/IntegratedView';
import { FormPanel } from './ui/FormPanel';
import { TextFieldSkeleton, TitleSkeleton } from './ui/skeletons';

export const PaymentWidget = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => {
  const { iframe, hostedField, custom } = useProviderIntegrationMode();
  const { setValue } = useFormContext();

  useEffect(() => {
    if (!hostedField) {
      setValue('token.value', undefined);
    }
  }, [hostedField]);

  const view = hostedField || custom ? <IntegratedView /> : iframe ? <IframeView /> : null;

  if (!view) {
    return null;
  }

  return (
    <div className={className}>
      {children}
      {view}
    </div>
  );
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
