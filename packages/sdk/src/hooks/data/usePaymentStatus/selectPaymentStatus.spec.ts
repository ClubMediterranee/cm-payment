import type { PaymentStatusModel } from '../../../__generated__/index.schemas';
import { StatutPaiement } from '../../../__generated__/index.schemas';
import { selectPaymentStatus } from './selectPaymentStatus';

describe('selectPaymentStatus', () => {
  it('maps the finalise payment response to a flat status object', () => {
    const response = {
      finalisePaymentResponse: {
        paiement: {
          statutPaiement: StatutPaiement.OK,
          montantVersement: '100.00',
          codeDevise: 'EUR',
          serveurId: 'M99BILLW',
        },
        dossier: { numeroDossier: 'BOOK123' },
      },
    } as unknown as PaymentStatusModel;

    expect(selectPaymentStatus(response)).toEqual({
      payment_status: StatutPaiement.OK,
      booking_id: 'BOOK123',
      payment_amount: '100.00',
      payment_currency: 'EUR',
      provider_id: 'M99BILLW',
    });
  });
});
