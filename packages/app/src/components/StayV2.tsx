import { formatDate, renderTemplate } from '@clubmed/caps';
import { Icon } from '@clubmed/trident-icons';
import type { PropsWithChildren } from 'react';

import { useContent } from '../hooks/useContent';
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
  const { app } = useContent();

  const { id } = useAppContext();

  return (
    <div className="flex w-full flex-col gap-12 rounded-32 border border-lightGrey bg-white p-20">
      <TicketRow>
        <div>
          <p className="text-sienna text-b5">{product?.destination?.countries?.[0].label}</p>
          <p className="text-b3">{product?.title}</p>
        </div>
      </TicketRow>
      <CheckedRow>
        <span>
          {renderTemplate(
            app.stay.dates,
            {
              start: formatStayDate(stay.resortArrivalDate),
              end: formatStayDate(stay.resortDepartureDate),
            },
            { asFragment: true },
          )}
        </span>
      </CheckedRow>
      {!!stay.adultsCount && (
        <CheckedRow>
          <span>
            {stay.childrenCount
              ? renderTemplate(
                  app.stay.adultsAndChildren,
                  { adults: stay.adultsCount, children: stay.childrenCount },
                  { asFragment: true },
                )
              : renderTemplate(app.stay.adults, { adults: stay.adultsCount }, { asFragment: true })}
          </span>
        </CheckedRow>
      )}
      <TicketRow>
        <span>{renderTemplate(app.stay.reference, { id }, { asFragment: true })}</span>
      </TicketRow>
      <div ref={donationSlotRef} />
    </div>
  );
};
