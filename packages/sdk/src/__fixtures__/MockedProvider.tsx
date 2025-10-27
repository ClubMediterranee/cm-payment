import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';

import { Action } from '../__generated__';
import { SDKConfigProvider } from '../providers/SDKConfigProvider';
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
  formDefaultValues?: any;
  action?: Action;
  proposalId?: string;
  bookingId?: string;
  customerId?: string;
}

export const MockedProvider = ({
  children,
  proposalId,
  bookingId,
  customerId,
  action = Action.PAYMENT_RESA,
  formDefaultValues = {
    amount: 0,
    provider_id: '',
    template_id: '',
    cgv: false,
    billing_details: {
      email: '',
      mobile_phone: '',
    },
  },
}: MockedProviderProps) => {
  const methods = useMockedForm({
    defaultValues: formDefaultValues,
  });

  useEffect(() => {
    queryClient.clear();
  }, [proposalId, bookingId, customerId]);

  return (
    <SDKConfigProvider
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
      <QueryClientProvider client={queryClient}>
        <MockedFormProvider {...methods}>{children}</MockedFormProvider>
      </QueryClientProvider>
    </SDKConfigProvider>
  );
};
