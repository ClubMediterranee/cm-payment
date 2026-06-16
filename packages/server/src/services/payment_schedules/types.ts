import {
  Action,
  CartUpgradeRoomModel,
  CustomerBookingPaymentScheduleModel,
  PaymentScheduleModel,
  ProposalPaymentScheduleModelV1,
} from '../../infra/api/__generated__/index.js';
import { ResourceType } from '../../utils/types.js';

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
  type: ResourceType;
  id: string | number;
  customer_id?: string | number;
  action: Action;
};
