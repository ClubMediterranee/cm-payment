import { OidcIssuerTypes } from '@clubmed/caps';
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
  callbackUrl: z.string().url(),
  callbackUrlSeller: z.string().url().optional(),
});

export function useAppParams() {
  const auth = useAuth();

  const [, setLocation] = useLocation();
  const [match, result] = useRoute('/:issuer/:type/:id');
  const [isConfirmationRoute, resultConfirmation] = useRoute('/:issuer/confirmation');
  const session = useSessionStorage('payment.params');

  const {
    customer_id,
    locale,
    action,
    callback_url: callbackUrl,
    callback_url_seller: callbackUrlSeller,
    ...confirmationParams
  } = useQueryParams<any>();

  if (auth.isLoading) {
    return null;
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
      callbackUrl,
      callbackUrlSeller,
    };

    const validationResult = ParamsSchema.safeParse(values);

    if (!validationResult.success) {
      console.error('[APP] Invalid parameters', validationResult, values);
      session.clear();
      setLocation('/400?error=invalid_parameters');
    }
    session.set(values);
  }

  const values = isConfirmationRoute ? { locale, ...confirmationParams } : session.get();

  if (!values) {
    return null;
  }

  const issuerType = (
    isConfirmationRoute ? resultConfirmation?.issuer.toUpperCase() : values?.issuerType
  ) as OidcIssuerTypes;

  const gmApiKey = values?.bookingId
    ? AppSettings.api[OidcIssuerTypes.GM].apiKey.CA
    : AppSettings.api[OidcIssuerTypes.GM].apiKey.BE;

  const apiKey = issuerType === OidcIssuerTypes.GM ? gmApiKey : AppSettings.api[issuerType].apiKey;

  return {
    values,
    api: { url: AppSettings.url, apiKey },
    oidc: {
      issuerType,
      accessToken: auth?.user?.access_token || '',
    },
  };
}
