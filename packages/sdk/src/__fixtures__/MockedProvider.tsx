import { IconsProvider } from '@clubmed/trident-icons';
import Actions from '@clubmed/trident-ui/atoms/Icons/svg/Actions';
import Brand from '@clubmed/trident-ui/atoms/Icons/svg/Brand';
import Utilities from '@clubmed/trident-ui/atoms/Icons/svg/Utilities';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense, useEffect } from 'react';

import { Action } from '../__generated__';
import { FeatureFlipsProvider } from '../providers/FeatureFlipsProvider';
import { SDKConfigProvider } from '../providers/SDKConfigProvider';
import { SDKContent } from '../types/Content';
import { SDKFormData } from '../types/FormData';
import { OidcIssuerTypes } from '../types/SDKOptions';
import { MockedFormProvider } from './MockedFormProvider';
import { useMockedForm } from './useMockedForm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
    },
  },
});

interface MockedProviderProps {
  children: React.ReactNode;
  defaultValues?: Partial<SDKFormData>;
  action?: Action;
  proposalId?: string;
  bookingId?: string;
  customerId?: string;
  content?: SDKContent;
}

export const MockedProvider = ({
  children,
  proposalId,
  bookingId,
  customerId,
  content,
  action = Action.PAYMENT_RESA,
  defaultValues,
}: MockedProviderProps) => {
  const methods = useMockedForm({
    defaultValues,
  });

  useEffect(() => {
    queryClient.clear();
  }, [proposalId, bookingId, customerId]);

  return (
    <QueryClientProvider client={queryClient}>
      <SDKConfigProvider
        content={content}
        key={`${proposalId}-${bookingId}-${customerId}`}
        url="https://mock.clubmed.com"
        action={action}
        proposalId={proposalId || undefined}
        bookingId={bookingId || undefined}
        customerId={customerId || 'test-customer'}
        locale="fr-FR"
        callbackUrl="http://localhost:3000/callback"
        oidc={{
          accessToken: 'test-token',
          issuerType: OidcIssuerTypes.GM,
        }}
        api={{
          url: 'https://mock.clubmed.com',
          apiKey: 'test-api-key',
        }}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <FeatureFlipsProvider locale="fr-FR">
            <IconsProvider icons={[Actions, Brand, Utilities]}>
              <MockedFormProvider {...methods}>{children}</MockedFormProvider>
            </IconsProvider>
          </FeatureFlipsProvider>
        </Suspense>
      </SDKConfigProvider>
    </QueryClientProvider>
  );
};
