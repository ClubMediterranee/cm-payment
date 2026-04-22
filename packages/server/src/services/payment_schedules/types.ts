import {
  Action,
  CartUpgradeRoomModel,
  CustomerBookingPaymentScheduleModel,
  PaymentScheduleModel,
  ProposalPaymentScheduleModelV1,
} from '../../infra/api/__generated__/index.schemas.js';

export type PaymentType = 'booking' | 'proposal';

export type ApiResponse =
  | ProposalPaymentScheduleModelV1
  | CustomerBookingPaymentScheduleModel
  | PaymentScheduleModel
  | CartUpgradeRoomModel;

export type PaymentSchedule = {
  currency: string;
  total?: number;
  payment_schedules: Array<{
    amount?: number;
    deadline?: string;
  }>;
};

export type PaymentScheduleOutput = {
  amount?: number;
  currency: string;
  deadline?: string;
  balance?: number;
};

export type PaymentScheduleParams = {
  type: PaymentType;
  id: string | number;
  customer_id?: string | number;
  action: Action;
};
