import {
  CAPS_PROTOCOL_VERSION,
  type CapsFormProps,
  defaultNavigate,
  getDefaultLocale,
  type NavigationRequest,
  OidcIssuerTypes,
  PaymentConfigProvider,
} from '@clubmed/caps';
import { IconsProvider } from '@clubmed/trident-icons';
import Actions from '@clubmed/trident-ui/atoms/Icons/svg/Actions';
import Brand from '@clubmed/trident-ui/atoms/Icons/svg/Brand';
import Utilities from '@clubmed/trident-ui/atoms/Icons/svg/Utilities';
import { Spinner } from '@clubmed/trident-ui/molecules/Spinner';
import { type ComponentProps, useEffect, useRef } from 'react';

import { CapsFlow, type FlowLabels } from './flow/CapsFlow';
import { useEmbedConfig } from './flow/useEmbedConfig';
import { ShadowHost } from './shadow/ShadowHost';

const ICONS = [Actions, Brand, Utilities];

/**
 * Props received from `CapsFormWebComponent` (`@clubmed/caps/webcomponent`), which resolves `capsUrl`.
 */
export type CapsRemoteFormProps = Omit<CapsFormProps, 'env' | 'url' | 'fallback'> & {
  capsUrl: string;
};

/**
 * The customer of a GM flow is the authenticated user (`sub` claim), like in the standalone app.
 */
export function getTokenSubject(accessToken?: string): string | undefined {
  try {
    const [, payload] = (accessToken || '').split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

    return JSON.parse(json).sub;
  } catch {
    return undefined;
  }
}

function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

function CapsForm(props: CapsRemoteFormProps) {
  const {
    capsUrl,
    issuerType,
    type,
    id,
    locale = getDefaultLocale(),
    accessToken,
    callbackUrl,
    callbackUrlSeller,
    action,
    reference,
    uuid,
    content,
    className,
    style,
  } = props;

  const callbacks = useLatest(props);
  const configState = useEmbedConfig(capsUrl, issuerType, type);

  const customerId =
    props.customerId ?? (issuerType === 'GM' ? getTokenSubject(accessToken) : undefined);

  const onNavigate = (request: NavigationRequest) => {
    if (callbacks.current.onRedirect?.(request.url) === false) {
      return;
    }

    defaultNavigate(request);
  };

  const onError = (error: Error) =>
    callbacks.current.onError?.({ code: 'FLOW_ERROR', message: error.message });

  // Bookings and seller flows are authenticated: the host must provide the token (the remote never signs in).
  const authError =
    !accessToken && (type === 'booking' || issuerType !== 'GM')
      ? `accessToken is required for ${issuerType} ${type} flows`
      : !customerId && issuerType !== 'GM'
        ? `customerId is required for ${issuerType} flows`
        : undefined;

  useEffect(() => {
    if (authError) {
      callbacks.current.onError?.({ code: 'AUTH_REQUIRED', message: authError });
    } else if (configState.status === 'error') {
      onError(configState.error);
    }
  }, [configState, authError]);

  let body;

  if (authError) {
    body = (
      <p className="text-red font-semibold my-4 text-center" role="alert">
        {authError}
      </p>
    );
  } else if (configState.status === 'loading') {
    body = (
      <div className="flex justify-center py-40">
        <Spinner className="w-48" />
      </div>
    );
  } else if (configState.status === 'error') {
    body = (
      <p className="text-red font-semibold my-4 text-center" role="alert">
        {configState.error.message}
      </p>
    );
  } else {
    const { embed: labels, ...sdkContent } = (content || {}) as {
      embed?: Partial<FlowLabels>;
    } & Record<string, unknown>;

    body = (
      <PaymentConfigProvider
        locale={locale}
        bookingId={type === 'booking' ? id : undefined}
        proposalId={type === 'proposal' ? id : undefined}
        customerId={customerId}
        api={{ url: capsUrl, apiKey: configState.config.apiKey }}
        oidc={{ issuerType: issuerType as OidcIssuerTypes, accessToken: accessToken || '' }}
        callbackUrl={callbackUrl}
        callbackUrlSeller={callbackUrlSeller}
        content={sdkContent as ComponentProps<typeof PaymentConfigProvider>['content']}
        onNavigate={onNavigate}
      >
        <CapsFlow
          labels={labels}
          action={action}
          reference={reference}
          uuid={uuid}
          onReady={() => callbacks.current.onReady?.()}
          onLoadingChange={(loading) => callbacks.current.onLoadingChange?.(loading)}
          onError={(error) => onError(error)}
        />
      </PaymentConfigProvider>
    );
  }

  return (
    <ShadowHost className={className} style={style}>
      <IconsProvider icons={ICONS}>
        <div className="w-full flex flex-col gap-8">{body}</div>
      </IconsProvider>
    </ShadowHost>
  );
}

/**
 * Checked by the wrapper before rendering: a different major version is refused.
 */
CapsForm.protocolVersion = CAPS_PROTOCOL_VERSION;

export { CapsForm };
export default CapsForm;
