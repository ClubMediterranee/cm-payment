import type { PaymentStatusModel } from '../../../__generated__/index.schemas';
import { StatutPaiement } from '../../../__generated__/index.schemas';
import { getPaymentStatusRefetchInterval } from './getPaymentStatusRefetchInterval';

const buildData = (statutPaiement: StatutPaiement) =>
  ({
    finalisePaymentResponse: { paiement: { statutPaiement } },
  }) as unknown as PaymentStatusModel;

describe('getPaymentStatusRefetchInterval', () => {
  it('returns the poll interval while the payment is PENDING', () => {
    const refetchInterval = getPaymentStatusRefetchInterval(2000);

    expect(refetchInterval(buildData(StatutPaiement.PENDING))).toBe(2000);
  });

  it('stops polling once the payment is no longer PENDING', () => {
    const refetchInterval = getPaymentStatusRefetchInterval(2000);

    expect(refetchInterval(buildData(StatutPaiement.OK))).toBe(false);
  });

  it('never polls when no interval is configured', () => {
    const refetchInterval = getPaymentStatusRefetchInterval();

    expect(refetchInterval(buildData(StatutPaiement.PENDING))).toBe(false);
  });

  it('stops polling when there is no data yet', () => {
    const refetchInterval = getPaymentStatusRefetchInterval(2000);

    expect(refetchInterval(undefined)).toBe(false);
  });
});
