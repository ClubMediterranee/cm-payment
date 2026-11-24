import type { Content, DeepPartial } from '@clubmed/caps';
import { useSuspenseQuery } from '@tanstack/react-query';
import { z } from 'zod';

import {
  type PaymentContent,
  paymentContentControllerGetPaymentContent,
} from '../__generated__/bff';
import { useAppContext } from '../providers/AppProvider';

type Template<P extends string[]> = P extends [
  infer Head extends string,
  ...infer Rest extends string[],
]
  ? `${string}{${Head}}${Template<Rest>}`
  : string;

const template = <const P extends string[]>(...placeholders: P) =>
  z.custom<Template<P>>(
    (value) => typeof value === 'string' && placeholders.every((p) => value.includes(`{${p}}`)),
    { message: `Expected a template with ${placeholders.map((p) => `{${p}}`).join(', ')}` },
  );

const appContentSchema = z.object({
  payment: z.object({
    title: z.string(),
    stayUnavailable: z.string(),
    retryLater: z.string(),
  }),
  header: z.object({
    back: z.string(),
    stayAt: z.string(),
  }),
  stay: z.object({
    placeholder: z.string(),
    dates: template('start', 'end'),
    adults: template('adults'),
    adultsAndChildren: template('adults', 'children'),
    reference: template('id'),
  }),
  confirmation: z.object({
    title: template('issuer'),
    myBooking: z.string(),
    amount: z.string(),
    paymentValidated: z.string(),
    paymentFailed: z.string(),
  }),
  notFound: z.string(),
});

export type AppContent = z.infer<typeof appContentSchema>;

export type CmsContent = { app: AppContent; content: DeepPartial<Content> };

export const defaultAppContent: AppContent = {
  payment: {
    title: 'Payment',
    stayUnavailable: 'We are unable to retrieve your stay information.',
    retryLater: 'Please try again later.',
  },
  header: { back: 'Back', stayAt: 'Your stay at:' },
  stay: {
    placeholder: 'Stay placeholder',
    dates: 'From {start} to {end}',
    adults: 'For {adults} adults',
    adultsAndChildren: 'For {adults} adults and {children} children',
    reference: 'Reference {id}',
  },
  confirmation: {
    title: 'Payment confirmation - {issuer}',
    myBooking: 'My booking',
    amount: 'Amount',
    paymentValidated: 'Your payment has been validated',
    paymentFailed: 'Your payment has failed',
  },
  notFound: '404 not found',
};

export const useContent = () => {
  const { api, values } = useAppContext();

  const { data } = useSuspenseQuery({
    queryKey: ['content', api.url, values.locale],
    queryFn: () => paymentContentControllerGetPaymentContent().catch((): PaymentContent => ({})),
    select: ({ app, ...content }): CmsContent => ({
      app: appContentSchema.catch(defaultAppContent).parse(app),
      content,
    }),
    staleTime: Infinity,
  });

  return data;
};
