import * as apiGenerated from '../../__generated__';
import { profileQueryOptions } from './useProfile';

describe('profileQueryOptions', () => {
  it('builds a queryKey scoped to the customerId', () => {
    expect(profileQueryOptions('customer-1').queryKey).toEqual(['profile', 'customer-1']);
  });

  it('invokes the generated profile endpoint with the customerId', async () => {
    const spy = vi
      .spyOn(apiGenerated, 'getV2CustomersCustomerIdProfile')
      .mockResolvedValue({ id: 'customer-1' } as any);

    const options = profileQueryOptions('customer-1');
    const result = await options.queryFn!({} as any);

    expect(spy).toHaveBeenCalledWith('customer-1');
    expect(result).toEqual({ id: 'customer-1' });

    spy.mockRestore();
  });

  it('disables retry to keep failures surface fast', () => {
    expect(profileQueryOptions('customer-1').retry).toBe(false);
  });
});
