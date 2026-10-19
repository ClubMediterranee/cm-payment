import classNames from 'classnames';
import { type ReactNode, useEffect, useRef } from 'react';

import type { Action } from '../../__generated__/index.schemas';
import { type CapsRemoteFormProps, type CapsTheme, getDefaultLocale } from '../../embed/shared';
import { CapsForm } from '../../providers/CapsForm';
import { PaymentConfigProvider } from '../../providers/PaymentConfigProvider';
import { OidcIssuerTypes } from '../../types/CapsSettings';
import type { Content, DeepPartial } from '../../types/Content';
import { defaultNavigate, type NavigationRequest } from '../../utils/navigate';
import { CurrentFlow } from './CurrentFlow';
import type { FlowLayoutProps } from './flowShared';
import { FlowErrorFallback } from './FlowErrorFallback';
import { LegacyFlow } from './LegacyFlow';

export type CapsPaymentFormProps = Omit<CapsRemoteFormProps, 'content'> & {
  content?: DeepPartial<Content>;
};

const FLOWS: Record<CapsTheme, (props: FlowLayoutProps) => ReactNode> = {
  current: CurrentFlow,
  legacy: LegacyFlow,
};

export function CapsPaymentForm(props: CapsPaymentFormProps) {
  const {
    capsUrl,
    apiKey,
    issuerType,
    type,
    id,
    locale = getDefaultLocale(),
    accessToken,
    customerId,
    callbackUrl,
    callbackUrlSeller,
    action,
    reference,
    uuid,
    content,
    theme = 'current',
    className,
    style,
    slots,
  } = props;

  const latest = useRef(props);
  latest.current = props;

  const reportFlowError = (error: Error) =>
    latest.current.onError?.({ code: 'FLOW_ERROR', message: error.message });

  useEffect(() => {
    latest.current.onReady?.();
  }, []);

  const Flow = FLOWS[theme];

  return (
    <div className={classNames('w-full', className)} style={style}>
      <PaymentConfigProvider
        locale={locale}
        bookingId={type === 'booking' ? id : undefined}
        proposalId={type === 'proposal' ? id : undefined}
        customerId={customerId}
        api={{ url: capsUrl, apiKey }}
        oidc={{ issuerType: issuerType as OidcIssuerTypes, accessToken: accessToken || '' }}
        callbackUrl={callbackUrl}
        callbackUrlSeller={callbackUrlSeller}
        content={content}
        onNavigate={(request: NavigationRequest) => {
          if (latest.current.onRedirect?.(request.url) !== false) {
            defaultNavigate(request);
          }
        }}
      >
        <div className="w-full flex flex-col gap-8">
          <CapsForm
            action={action as Action | undefined}
            errorFallback={(fallbackProps) => (
              <FlowErrorFallback {...fallbackProps} onError={reportFlowError} />
            )}
            onError={(error: Error) => {
              latest.current.onLoadingChange?.(false);
              reportFlowError(error);
            }}
            onLoad={() => latest.current.onLoadingChange?.(true)}
            onLoadEnd={() => latest.current.onLoadingChange?.(false)}
          >
            {Flow({ slots, reference, uuid })}
          </CapsForm>
        </div>
      </PaymentConfigProvider>
    </div>
  );
}
