import { OidcIssuerTypes } from '@clubmed/payment-sdk/types/CapsSettings';
import { useAuth } from 'react-oidc-context';
import { useLocation, useRoute } from 'wouter';
import { z } from 'zod';

import { AppSettings } from '../config';
import { useQueryParams } from './useQueryParams.js';
import { useSessionStorage } from './useSessionStorage';

const ParamsSchema = z.object({
  proposalId: z
    .string()
    .regex(/[0-9]+/)
    .optional(),
  bookingId: z
    .string()
    .regex(/[0-9]+/)
    .optional(),
  customerId: z
    .string()
    .regex(/[0-9]+/)
    .optional(),
  issuerType: z.enum([OidcIssuerTypes.GM, OidcIssuerTypes.GO, OidcIssuerTypes.PARTNERS]),
  locale: z
    .string()
    .regex(/[a-z]{2}-[A-Z]{2}/)
    .optional(),
  action: z.string().optional(),
});

export function useAppParams() {
  const auth = useAuth();
  const [, setLocation] = useLocation();
  const [match, result] = useRoute('/:issuer/:type/:id');
  const session = useSessionStorage('payment.params');

  const { customer_id, locale, action } = useQueryParams<any>();

  if (auth.isLoading) {
    return {};
  }

  if (match) {
    const customerId =
      auth.isAuthenticated && result?.issuer.toUpperCase() === OidcIssuerTypes.GM
        ? (auth?.user?.profile?.sub as string)
        : customer_id;

    const values = {
      issuerType: result?.issuer.toUpperCase() as OidcIssuerTypes,
      bookingId: result?.type === 'booking' ? result?.id : undefined,
      proposalId: result?.type === 'proposal' ? result?.id : undefined,
      customerId,
      locale: locale || navigator.language || 'fr-FR',
      action,
    };

    if (values?.bookingId && !auth.isAuthenticated) {
      setLocation('/404');
    }

    const validationResult = ParamsSchema.safeParse(values);

    if (!validationResult.success) {
      console.error('[APP] Invalid parameters', validationResult, values);
      session.clear();
      setLocation('/400?error=invalid_parameters');
    }
    session.set(values);
  }

  const values = session.get();

  if (values) {
    const url = import.meta.env.VITE_DOMAIN || window.location.origin;

    return {
      url,
      values,
      api: AppSettings.api[values?.issuerType as OidcIssuerTypes],
      oidc: {
        issuerType: values?.issuerType as OidcIssuerTypes,
        accessToken: auth?.user?.access_token || '',
      },
      callbackUrl: `${url}/confirmation`,
      isIframe: window.self !== window.top,
    };
  }

  return {};
}
