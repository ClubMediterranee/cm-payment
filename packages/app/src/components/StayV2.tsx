import { formatDate } from '@clubmed/caps';
import { Icon } from '@clubmed/trident-icons';
import type { PropsWithChildren } from 'react';

import { useProduct } from '../hooks/useProduct';
import type { StayModel } from '../hooks/useStay.js';
import { useAppContext } from '../providers/AppProvider';

export type StayV2Props = {
  stay: StayModel;
  donationSlotRef?: (element: HTMLElement | null) => void;
};

const formatStayDate = (date?: string | null) => {
  return formatDate(date, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const TicketRow = ({ children }: PropsWithChildren) => (
  <div className="flex items-center justify-between gap-12 rounded-16 border border-lightGrey bg-white px-12 py-8 text-b4 font-bold">
    {children}
  </div>
);

const CheckedRow = ({ children }: PropsWithChildren) => (
  <TicketRow>
    {children}
    <Icon name="CheckDefault" width="1rem" className="shrink-0 text-green" />
  </TicketRow>
);

export const StayV2 = ({ stay, donationSlotRef }: StayV2Props) => {
  const { data: product } = useProduct(stay);

  const { id } = useAppContext();

  return (
    <div className="flex w-full flex-col gap-8 rounded-32 border border-lightGrey bg-white p-12">
      <TicketRow>
        <div>
          <p className="text-sienna text-b5">{product?.destination?.countries?.[0].label}</p>
          <p className="text-b3">{product?.title}</p>
        </div>
      </TicketRow>
      <CheckedRow>
        <span>
          A partir de {formatStayDate(stay.resortArrivalDate)} au{' '}
          {formatStayDate(stay.resortDepartureDate)}
        </span>
      </CheckedRow>
      {!!stay.adultsCount && (
        <CheckedRow>
          <span>
            Pour {stay.adultsCount} adultes
            {stay.childrenCount ? ` et ${stay.childrenCount} enfants` : ''}
          </span>
        </CheckedRow>
      )}
      <TicketRow>
        <span>Réference {id}</span>
      </TicketRow>
      <div ref={donationSlotRef} />
    </div>
  );
};
