import {
  Action,
  BillingAddress,
  CardInstallments,
  type CapsRemoteFormProps,
  Cgv,
  Comments,
  ContactChoice,
  defaultNavigate,
  Donation,
  Form,
  getDefaultLocale,
  type NavigationRequest,
  OidcIssuerTypes,
  PaymentConfigProvider,
  PaymentProviders,
  PaymentSchedule,
  PaymentWidget,
  SubmitButton,
  useFormSubmit,
} from '@clubmed/caps';
import { IconsProvider } from '@clubmed/trident-icons';
import Actions from '@clubmed/trident-ui/atoms/Icons/svg/Actions';
import Brand from '@clubmed/trident-ui/atoms/Icons/svg/Brand';
import Utilities from '@clubmed/trident-ui/atoms/Icons/svg/Utilities';
import { Spinner } from '@clubmed/trident-ui/molecules/Spinner';
import {
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useEmbedConfig } from './flow/useEmbedConfig';
import { ShadowHost, ShadowSlot } from './shadow/ShadowHost';

export type { CapsRemoteFormProps };

const ICONS = [Actions, Brand, Utilities];

const DEFAULT_LABELS = {
  paymentSchedule: 'Choose your payment schedule',
  paymentProviders: 'Which payment method would you like to use?',
  cardInstallments: 'Choose your card installments',
  contactChoice: 'How would you like to be contacted?',
  donation: 'Make a donation',
  comments: 'Comments',
  cgv: 'Terms and conditions',
  billingAddress: 'Billing address',
  paymentWidget: 'Payment details',
  submit: 'Pay',
};

type FlowLabels = typeof DEFAULT_LABELS;

const Title = ({ children }: { children: string }) => (
  <h2 className="text-h5 mb-16 font-serif">{children}</h2>
);

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

export function SubmitSlot({ target, children }: { target?: HTMLElement; children: ReactNode }) {
  const { onSubmit } = useFormSubmit();

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      'button[type="submit"]',
    );

    if (button && !button.form) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <ShadowSlot target={target}>
      <div className="flex flex-col" onClickCapture={onClickCapture}>
        {children}
      </div>
    </ShadowSlot>
  );
}

function RemoteCapsForm(props: CapsRemoteFormProps) {
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
    slots,
    className,
    style,
  } = props;

  const latest = useLatest(props);
  const configState = useEmbedConfig(capsUrl, issuerType, type);

  const customerId =
    props.customerId ?? (issuerType === 'GM' ? getTokenSubject(accessToken) : undefined);

  const authError =
    !accessToken && (type === 'booking' || issuerType !== 'GM')
      ? `accessToken is required for ${issuerType} ${type} flows`
      : !customerId && issuerType !== 'GM'
        ? `customerId is required for ${issuerType} flows`
        : undefined;

  useEffect(() => {
    if (authError) {
      latest.current.onError?.({ code: 'AUTH_REQUIRED', message: authError });
    } else if (configState.status === 'error') {
      latest.current.onError?.({ code: 'FLOW_ERROR', message: configState.error.message });
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
    const { embed, ...sdkContent } = (content || {}) as {
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
        onNavigate={(request: NavigationRequest) => {
          if (latest.current.onRedirect?.(request.url) !== false) {
            defaultNavigate(request);
          }
        }}
      >
        <Flow
          labels={{ ...DEFAULT_LABELS, ...embed }}
          slots={slots}
          action={action}
          reference={reference}
          uuid={uuid}
          onReady={() => latest.current.onReady?.()}
          onLoadingChange={(loading) => latest.current.onLoadingChange?.(loading)}
          onError={(error) =>
            latest.current.onError?.({ code: 'FLOW_ERROR', message: error.message })
          }
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

function FlowErrorFallback({
  error,
  resetErrorBoundary,
  onError,
}: {
  error: unknown;
  resetErrorBoundary: () => void;
  onError?: (error: Error) => void;
}) {
  const message = error instanceof Error ? error.message : String(error);

  useEffect(() => {
    onError?.(error instanceof Error ? error : new Error(message));
  }, [error]);

  return (
    <div className="p-40 text-center" role="alert">
      <h2 className="text-20 font-bold text-red mb-16">Impossible d'afficher le formulaire</h2>
      <p className="text-14 text-middleGrey mb-16">{message}</p>
      <button type="button" className="underline font-semibold" onClick={resetErrorBoundary}>
        Réessayer
      </button>
    </div>
  );
}

type FlowProps = {
  labels: FlowLabels;
  slots?: CapsRemoteFormProps['slots'];
  action?: string;
  reference?: string;
  uuid?: string;
  onReady: () => void;
  onLoadingChange: (loading: boolean) => void;
  onError: (error: Error) => void;
};

function Flow({
  labels,
  slots,
  action,
  reference,
  uuid,
  onReady,
  onLoadingChange,
  onError,
}: FlowProps) {
  const [error, setError] = useState<Error>();
  const errorRef = useRef<HTMLParagraphElement>(null);
  const callbacks = useLatest({ onReady, onLoadingChange, onError });

  useEffect(() => {
    callbacks.current.onReady();
  }, []);

  useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({ block: 'center' });
    }
  }, [error]);

  return (
    <Form
      action={action as Action | undefined}
      errorFallback={(props) => (
        <FlowErrorFallback {...props} onError={callbacks.current.onError} />
      )}
      onError={(err: Error) => {
        setError(err);
        callbacks.current.onLoadingChange(false);
        callbacks.current.onError(err);
      }}
      onLoad={() => callbacks.current.onLoadingChange(true)}
      onLoadEnd={() => callbacks.current.onLoadingChange(false)}
    >
      <PaymentSchedule>
        <Title>{labels.paymentSchedule}</Title>
      </PaymentSchedule>
      <PaymentProviders>
        <Title>{labels.paymentProviders}</Title>
      </PaymentProviders>
      <CardInstallments>
        <Title>{labels.cardInstallments}</Title>
      </CardInstallments>
      <ContactChoice reference={reference} uuid={uuid}>
        <Title>{labels.contactChoice}</Title>
      </ContactChoice>
      <ShadowSlot target={slots?.donation}>
        <Donation>
          <Title>{labels.donation}</Title>
        </Donation>
      </ShadowSlot>
      <Comments>
        <Title>{labels.comments}</Title>
      </Comments>
      <Cgv>
        <Title>{labels.cgv}</Title>
      </Cgv>
      <BillingAddress>
        <Title>{labels.billingAddress}</Title>
      </BillingAddress>
      <PaymentWidget>
        <Title>{labels.paymentWidget}</Title>
      </PaymentWidget>
      {error?.message && (
        <p ref={errorRef} className="text-red font-semibold my-4 text-center">
          {error.message}
        </p>
      )}
      <SubmitSlot target={slots?.submit}>
        <SubmitButton className={slots?.submit ? 'w-full' : 'my-8 self-center'}>
          {labels.submit}
        </SubmitButton>
      </SubmitSlot>
    </Form>
  );
}

export { RemoteCapsForm };
export default RemoteCapsForm;
