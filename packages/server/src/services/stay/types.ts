export type StayType = 'booking' | 'proposal';

export interface GetStayParams {
  type: StayType;
  id: string;
  customerId?: string;
}
