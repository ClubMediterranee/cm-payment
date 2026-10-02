import { useQuery } from '@tanstack/react-query';

import { paymentProvidersControllerGetBnplSimulation } from '../../__generated__/bff';

type BnplProviderId = Parameters<typeof paymentProvidersControllerGetBnplSimulation>[0];

export interface BnplInstalment {
  number: number;
  amount: number;
  date: string;
}

export interface BnplSimulation {
  cost: number;
  instalments: BnplInstalment[];
}

export const useBnplSimulation = ({
  providerId,
  paymentAmount,
  enabled,
}: {
  providerId: BnplProviderId;
  paymentAmount: number;
  enabled?: boolean;
}) =>
  useQuery({
    queryKey: ['bnplSimulation', providerId, paymentAmount],
    queryFn: () =>
      paymentProvidersControllerGetBnplSimulation(providerId, {
        payment_amount: paymentAmount,
      }) as Promise<BnplSimulation>,
    enabled,
  });
