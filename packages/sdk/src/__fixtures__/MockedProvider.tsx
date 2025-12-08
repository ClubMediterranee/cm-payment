import { IconsProvider } from '@clubmed/trident-icons';
import Actions from '@clubmed/trident-ui/atoms/Icons/svg/Actions';
import Brand from '@clubmed/trident-ui/atoms/Icons/svg/Brand';
import Utilities from '@clubmed/trident-ui/atoms/Icons/svg/Utilities';
import React, { Suspense, useEffect } from 'react';

import { Action } from '../__generated__';
import { defaultContent } from '../content/default';
import { ACTION_RESOLVER_QUERY_KEY } from '../hooks/data/useActionResolver';
import { PAYMENT_CONFIG_QUERY_KEY } from '../hooks/data/usePaymentConfig';
import { CapsConfigProvider } from '../providers/CapsConfigProvider';
import { sdkQueryClient } from '../providers/QueryClientProvider';
import { OidcIssuerTypes, OidcSettings } from '../types/CapsSettings';
import { Content } from '../types/Content';
import { CapsFormData } from '../types/FormData';
import { PaymentConfig } from '../types/PaymentConfig';
import { mergeFromPattern } from '../utils/mergeFromPattern';
import { MockedFormProvider } from './MockedFormProvider';
import { useMockedForm } from './useMockedForm';

interface MockedProviderProps {
  children: React.ReactNode;
  defaultValues?: Partial<CapsFormData>;
  action?: Action;
  proposalId?: string;
  oidc?: OidcSettings;
  bookingId?: string;
  customerId?: string;
  content?: Content;
  paymentConfig?: PaymentConfig;
  maxAmount?: number;
}

export const MockedProvider = ({
  children,
  proposalId,
  bookingId,
  customerId,
  content,
  action,
  oidc,
  defaultValues,
  paymentConfig,
  maxAmount = 10000,
}: MockedProviderProps) => {
  const isSeller = [OidcIssuerTypes.PARTNERS, OidcIssuerTypes.GO].includes(
    oidc?.issuerType as OidcIssuerTypes,
  );

  const methods = useMockedForm({
    defaultValues: {
      ...defaultValues,
      action,
    },
    content: mergeFromPattern(defaultContent, content),
    isSeller,
    maxAmount,
  });

  useEffect(() => {
    sdkQueryClient.clear();
  }, []);

  useEffect(() => {
    if (action && (proposalId || bookingId)) {
      const id = bookingId || proposalId!;
      const type = bookingId ? 'booking' : 'proposal';
      sdkQueryClient.setQueryData(ACTION_RESOLVER_QUERY_KEY(id, type), action);
    }
  }, [proposalId, bookingId, customerId, action]);

  useEffect(() => {
    if (paymentConfig) {
      sdkQueryClient.setQueryData(
        PAYMENT_CONFIG_QUERY_KEY('fr-FR', oidc?.issuerType || OidcIssuerTypes.GM),
        {
          ...paymentConfig,
          settings: { daysBeforeTripToAllowFreeDeposit: 0, ...paymentConfig.settings },
        },
      );
    }
  }, [paymentConfig]);

  return (
    <CapsConfigProvider
      content={content}
      paymentGatewayUrl="https://mock.clubmed.com"
      locale="fr-FR"
      callbackUrl="http://localhost:3000/callback"
      proposalId={proposalId}
      bookingId={bookingId}
      customerId={customerId}
      oidc={{
        accessToken: 'test-token',
        issuerType: OidcIssuerTypes.GM,
        ...oidc,
      }}
      api={{
        url: 'https://mock.clubmed.com',
        apiKey: 'test-api-key',
      }}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <IconsProvider icons={[Actions, Brand, Utilities]}>
          <MockedFormProvider {...methods}>{children}</MockedFormProvider>
        </IconsProvider>
      </Suspense>
    </CapsConfigProvider>
  );
};
