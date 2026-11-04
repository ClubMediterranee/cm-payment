import type { ContractSimulation } from '../../../infra/oney/__generated__/index.js';
import { mapOneySimulation } from './mapOneySimulation.js';

const buildSimulation = (overrides: Partial<ContractSimulation> = {}): ContractSimulation => ({
  payment_amount: 300,
  effective_annual_percentage_rate: 0,
  administration_fee_amount: 0,
  total_cost: 12.5,
  down_payment_amount: 100,
  nominal_annual_percentage_rate: 0,
  first_instalment_date: '2026-11-01',
  ...overrides,
});

describe('mapOneySimulation', () => {
  it('maps the down payment as instalment 0 followed by the scheduled instalments', () => {
    const result = mapOneySimulation(
      buildSimulation({
        instalments: [
          {
            instalment_number: 1,
            instalment_amount: 100,
            insurance_amount: 0,
            interest_amount: 0,
            collection_date: '2026-12-01',
          },
          {
            instalment_number: 2,
            instalment_amount: 112.5,
            insurance_amount: 0,
            interest_amount: 12.5,
            collection_date: '2027-01-01',
          },
        ],
      }),
    );

    expect(result).toEqual({
      cost: 12.5,
      instalments: [
        { number: 0, amount: 100, date: '2026-11-01' },
        { number: 1, amount: 100, date: '2026-12-01' },
        { number: 2, amount: 112.5, date: '2027-01-01' },
      ],
    });
  });

  it('only returns the down payment when there are no instalments', () => {
    expect(mapOneySimulation(buildSimulation())).toEqual({
      cost: 12.5,
      instalments: [{ number: 0, amount: 100, date: '2026-11-01' }],
    });
  });
});
