import type { CmsContent } from '../hooks/useContent';

export const content: CmsContent = {
  content: { cgv: { heading: 'CGV' } },
  app: {
    payment: {
      title: 'Payment',
      stayUnavailable: 'We are unable to retrieve your stay information.',
      retryLater: 'Please try again later.',
    },
    header: { back: 'Retour', stayAt: 'Your stay at:' },
    stay: {
      placeholder: 'Stay placeholder',
      dates: 'A partir de {start} au {end}',
      adults: 'Pour {adults} adultes',
      adultsAndChildren: 'Pour {adults} adultes et {children} enfants',
      reference: 'Réference {id}',
    },
    confirmation: {
      title: 'Payment confirmation - {issuer}',
      myBooking: 'My booking',
      amount: 'Amount',
      paymentValidated: 'Your payment has been validated',
      paymentFailed: 'Your payment has failed',
    },
    notFound: '404 not found',
  },
};
