import {
  CapsPaymentForm,
  type CapsPaymentFormProps,
  type CapsRemoteFormProps,
} from '@clubmed/caps';
import { IconsProvider } from '@clubmed/trident-icons';
import Actions from '@clubmed/trident-icons/svg/Actions';
import Brand from '@clubmed/trident-icons/svg/Brand';
import Utilities from '@clubmed/trident-icons/svg/Utilities';
import { useState } from 'react';

import { PaymentErrorMessage } from './PaymentErrorMessage';
import { ShadowHost, useShadowSlots } from './shadow/ShadowHost';

export type { CapsRemoteFormProps };

const ICONS = [Actions, Brand, Utilities];

function RemoteCapsForm({
  slots,
  className,
  style,
  content,
  onError,
  ...props
}: CapsRemoteFormProps) {
  const [errorMessage, setErrorMessage] = useState<string>();
  const shadowSlots = useShadowSlots(slots);

  return (
    <ShadowHost className={className} style={style}>
      <IconsProvider icons={ICONS}>
        <CapsPaymentForm
          {...props}
          slots={shadowSlots}
          content={content as CapsPaymentFormProps['content']}
          onError={(error) => {
            setErrorMessage(error.code === 'FLOW_ERROR' ? error.message : undefined);
            onError?.(error);
          }}
        />
        <PaymentErrorMessage message={errorMessage} />
      </IconsProvider>
    </ShadowHost>
  );
}

export { RemoteCapsForm };
export default RemoteCapsForm;
