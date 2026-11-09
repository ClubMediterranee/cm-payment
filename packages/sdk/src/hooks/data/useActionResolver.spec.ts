import { sdkQueryClient } from '../../providers/QueryClientProvider';
import {
  ACTION_RESOLVER_QUERY_KEY,
  actionResolverQuery,
  getResolvedAction,
} from './useActionResolver';

vi.mock('../../providers/PaymentConfigProvider', () => ({
  getPaymentConfig: () => ({ id: 'BK1', type: 'booking', customerId: 'customer-2' }),
}));

describe('useActionResolver', () => {
  afterEach(() => sdkQueryClient.clear());

  it('builds a queryKey scoped to the customerId', () => {
    expect(
      actionResolverQuery({ id: 'BK1', type: 'booking', customerId: 'customer-1' }).queryKey,
    ).toEqual(['resolveAction', 'BK1', 'booking', 'customer-1']);
  });

  it('reads the action resolved for the current customer only', () => {
    sdkQueryClient.setQueryData(ACTION_RESOLVER_QUERY_KEY('BK1', 'booking', 'customer-1'), 'A');
    expect(getResolvedAction()).toBeUndefined();

    sdkQueryClient.setQueryData(ACTION_RESOLVER_QUERY_KEY('BK1', 'booking', 'customer-2'), 'B');
    expect(getResolvedAction()).toBe('B');
  });
});
