import { useQuery } from '@tanstack/react-query';

import { postV0PaymentProvidersProviderIdRequestToken } from '../../__generated__';
import type { CybersourceTokenRequestParams } from '../../__generated__/index.schemas';
import type { CybersourceConfig, CybersourceTokenResponse } from '../../types/Cybersource';
import { PspProviders } from '../../types/PspProviders';
import { decodeJwt } from '../../utils/decodeJwt';

type ProviderParamsMap = {
  [PspProviders.MCYBERSOURCE]: CybersourceTokenRequestParams;
};

type ProviderResponseMap = {
  [PspProviders.MCYBERSOURCE]: CybersourceTokenResponse;
};

type UseRequestTokenParams<T extends keyof ProviderParamsMap> = {
  providerId: T;
  params: ProviderParamsMap[T];
};

type ProviderConfigMap = {
  [PspProviders.MCYBERSOURCE]: CybersourceConfig;
};

type RequestTokenResult<T extends keyof ProviderParamsMap> = {
  token: string;
  config: ProviderConfigMap[T];
};

export const useRequestToken = <T extends keyof ProviderParamsMap>({
  providerId,
  params,
}: UseRequestTokenParams<T>) => {
  return useQuery({
    queryKey: ['request_token', providerId, params],
    queryFn: () => postV0PaymentProvidersProviderIdRequestToken(providerId, { params }),
    select: (data): RequestTokenResult<T> => {
      const result = {
        token: data.token,
        config: {} as ProviderConfigMap[T],
      };

      if (providerId === PspProviders.MCYBERSOURCE) {
        const decodedToken = decodeJwt<ProviderResponseMap[T]>(data.token);
        const tokenData = decodedToken.ctx[0]?.data;

        result.config = {
          scriptUrl: tokenData?.clientLibrary || '',
          scriptIntegrity: tokenData?.clientLibraryIntegrity || '',
          allowedCardNetworks: tokenData?.allowedCardNetworks,
        } as ProviderConfigMap[T];
      }

      return result;
    },
    staleTime: Infinity,
  });
};
