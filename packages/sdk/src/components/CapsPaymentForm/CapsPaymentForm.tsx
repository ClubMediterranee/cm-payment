import classNames from 'classnames';
import { type ReactNode, Suspense, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import type { Action } from '../../__generated__/index.schemas';
import { errorEvent, redirectEvent } from '../../embed/shared/events';
import {
  type CapsEvent,
  type CapsRemoteFormProps,
  type CapsTheme,
  getDefaultLocale,
} from '../../embed/shared';
import { useCapsTheme } from '../../hooks/data/usePaymentConfig';
import { StepperContext } from '../../contexts/StepperContext';
import { CapsForm } from '../../providers/CapsForm';
import { PaymentConfigProvider } from '../../providers/PaymentConfigProvider';
import { contentByTheme } from '../../content/themes';
import { type CapsSettings, OidcIssuerTypes } from '../../types/CapsSettings';
import type { Content, DeepPartial } from '../../types/Content';
import { mergeFromPattern } from '../../utils/mergeFromPattern';
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

type ThemeGateProps = {
  theme?: CapsTheme;
  config: Pick<CapsSettings, 'locale' | 'oidc' | 'api'>;
  onError: (error: Error) => void;
  children: (theme: CapsTheme) => ReactNode;
};

const ConfiguredTheme = ({ config, children }: Pick<ThemeGateProps, 'config' | 'children'>) =>
  children(useCapsTheme(config));

const ThemeGate = ({ theme, config, onError, children }: ThemeGateProps) =>
  theme ? (
    children(theme)
  ) : (
    <ErrorBoundary
      fallbackRender={(fallbackProps) => <FlowErrorFallback {...fallbackProps} onError={onError} />}
    >
      <Suspense fallback={null}>
        <ConfiguredTheme config={config}>{children}</ConfiguredTheme>
      </Suspense>
    </ErrorBoundary>
  );

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
    salesNetworkId,
    salesmanId,
    opportunityId,
    action,
    reference,
    uuid,
    content,
    theme,
    stepper = false,
    className,
    style,
    slots,
  } = props;

  const latest = useRef(props);
  latest.current = props;

  const emit = (event: CapsEvent) => {
    try {
      latest.current.onEvent?.(event);
    } catch (error) {
      console.error('[CAPS] onEvent handler failed', error);
    }
  };

  const reportFlowError = (error: Error) =>
    emit(errorEvent({ code: 'FLOW_ERROR', message: error.message }));

  const oidc = { issuerType: issuerType as OidcIssuerTypes, accessToken: accessToken || '' };
  const api = { url: capsUrl, apiKey };

  return (
    <div className={classNames('w-full', className)} style={style}>
      <ThemeGate theme={theme} config={{ locale, oidc, api }} onError={reportFlowError}>
        {(resolvedTheme) => {
          const isStepper = stepper && resolvedTheme === 'current';
          const Flow = FLOWS[resolvedTheme];

          return (
            <PaymentConfigProvider
              theme={resolvedTheme}
              locale={locale}
              bookingId={type === 'booking' ? id : undefined}
              proposalId={type === 'proposal' ? id : undefined}
              customerId={customerId}
              api={api}
              oidc={oidc}
              callbackUrl={callbackUrl}
              callbackUrlSeller={callbackUrlSeller}
              salesNetworkId={salesNetworkId}
              salesmanId={salesmanId}
              opportunityId={opportunityId}
              content={content}
              onNavigate={(request: NavigationRequest) => {
                if (latest.current.onRedirect?.(request.url) !== false) {
                  emit(redirectEvent(request.url));
                  defaultNavigate(request);
                }
              }}
            >
              <StepperContext.Provider value={isStepper}>
                <div className="w-full flex flex-col gap-8">
                  <CapsForm
                    action={action as Action | undefined}
                    stepper={isStepper}
                    errorFallback={(fallbackProps) => (
                      <FlowErrorFallback {...fallbackProps} onError={reportFlowError} />
                    )}
                    onEvent={emit}
                  >
                    {Flow({
                      content: mergeFromPattern(contentByTheme[resolvedTheme], content),
                      slots,
                      reference,
                      uuid,
                    })}
                  </CapsForm>
                </div>
              </StepperContext.Provider>
            </PaymentConfigProvider>
          );
        }}
      </ThemeGate>
    </div>
  );
}
