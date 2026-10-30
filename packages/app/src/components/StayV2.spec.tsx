import { render, screen } from '@testing-library/react';

import type { StayModel } from '../hooks/useStay';
import { StayV2 } from './StayV2';

vi.mock('../providers/AppProvider', () => ({ useAppContext: () => ({ id: 'booking-1' }) }));
vi.mock('../hooks/useProduct', () => ({
  useProduct: () => ({
    data: { title: 'Cancun', destination: { countries: [{ label: 'Mexique' }] } },
  }),
}));

const stay = {
  productId: 'BAHA',
  resortArrivalDate: '2026-12-01',
  resortDepartureDate: '2026-12-08',
  adultsCount: 2,
  childrenCount: 1,
} as StayModel;

describe('StayV2', () => {
  it('renders the product, dates, travellers and reference', () => {
    render(<StayV2 stay={stay} />);

    expect(screen.getByText('Mexique')).toBeTruthy();
    expect(screen.getByText('Cancun')).toBeTruthy();
    expect(screen.getByText(/A partir de/)).toBeTruthy();
    expect(screen.getByText('Pour 2 adultes et 1 enfants')).toBeTruthy();
    expect(screen.getByText('Réference booking-1')).toBeTruthy();
  });

  it('omits the children and the travellers row when they are missing', () => {
    const { rerender } = render(<StayV2 stay={{ ...stay, childrenCount: 0 }} />);
    expect(screen.getByText('Pour 2 adultes')).toBeTruthy();

    rerender(<StayV2 stay={{ ...stay, adultsCount: 0 }} />);
    expect(screen.queryByText(/Pour/)).toBeNull();
  });

  it('exposes the donation slot', () => {
    const donationSlotRef = vi.fn();

    render(<StayV2 stay={stay} donationSlotRef={donationSlotRef} />);

    expect(donationSlotRef).toHaveBeenCalledWith(expect.any(HTMLElement));
  });
});
