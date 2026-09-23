import {
  Action,
  CartModel,
  CartUpgradeRoomModel,
  CustomerBookingPaymentScheduleModel,
  ProposalPaymentScheduleModelV1,
  ServicesV3Model,
} from '../../infra/api/__generated__/index.js';

export type ApiResponse =
  | ProposalPaymentScheduleModelV1
  | CustomerBookingPaymentScheduleModel
  | CartModel
  | CartUpgradeRoomModel
  | ServicesV3Model;

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
  id: string | number;
  customer_id?: string | number;
  action: Action;
};
