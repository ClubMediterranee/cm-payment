import type { ContractSimulation } from '../../../infra/oney/__generated__/index.js';
import type { BnplSimulation } from '../types.js';

export function mapOneySimulation({
  total_cost,
  down_payment_amount,
  first_instalment_date,
  instalments = [],
}: ContractSimulation): BnplSimulation {
  return {
    cost: total_cost,
    instalments: [
      { number: 0, amount: down_payment_amount, date: first_instalment_date },
      ...instalments.map(({ instalment_number, instalment_amount, collection_date }) => ({
        number: instalment_number,
        amount: instalment_amount,
        date: collection_date,
      })),
    ],
  };
}
