import type { ApiProduct } from '@clubmed/infra/clubmed/interfaces/product/index.js';
import { DIContext, DITest, inject, runInContext } from '@tsed/di';

import { ApiClient } from './ApiClient.js';

vi.mock('axios');
vi.mock('axios-retry');

function createServiceFixture() {
  const client = inject(ApiClient);
  const ctx = new DIContext({
    id: 'id',
  });

  vi.spyOn(ctx.logger, 'info');
  vi.spyOn(ctx.logger, 'warn');

  return { client, ctx };
}

describe('ApiClient', () => {
  beforeEach(() => DITest.create());
  afterEach(() => DITest.reset());

  describe('get()', () => {
    it('should call endpoint without authorization', async () => {
      // GIVEN
      const { client, ctx } = createServiceFixture();

      vi.spyOn(client, 'raw').mockResolvedValue({
        headers: {
          'x-test': 'test',
        },
      } as never);

      // WHEN
      await runInContext(ctx, () => client.get('/test', {}));

      expect(client.raw).toHaveBeenCalledWith({
        data: undefined,
        method: 'GET',
        url: '/test',
      });
    });
  });
  describe('getLocales()', () => {
    it('should call endpoint to get locales', async () => {
      // GIVEN
      const { client, ctx } = createServiceFixture();
      const expectedLocales = ['fr_FR', 'en_GB'];

      vi.spyOn(client, 'raw').mockResolvedValue({
        data: expectedLocales,
        headers: {
          'x-test': 'test',
        },
      } as never);

      // WHEN
      const result = await runInContext(ctx, () => client.getLocales());

      // THEN
      expect(client.raw).toHaveBeenCalledWith({
        method: 'GET',
        url: '/v0/locales',
      });
      expect(result).toEqual(expectedLocales);
    });
  });
  describe('getProducts()', () => {
    it('should call endpoint to get products with locale', async () => {
      // GIVEN
      const { client, ctx } = await createServiceFixture();
      const locale = 'fr_FR';
      const expectedProducts: ApiProduct[] = [
        {
          id: 'test',
          full_title: 'Test Resort',
          opening_status: 'OPEN',
          resort_id: 'TEST',
          title: 'Test',
          key_points: [],
          kids_activities_introduction: {} as any,
          exclusive_collection_introduction: {} as any,
        },
      ] as any;

      vi.spyOn(client, 'raw').mockResolvedValue({
        data: expectedProducts,
        headers: {
          'x-test': 'test',
        },
      } as never);

      // WHEN
      const result = await runInContext(ctx, () => client.getProducts(locale));

      // THEN
      expect(client.raw).toHaveBeenCalledWith({
        method: 'GET',
        url: '/v2/products',
        headers: {
          'Accept-Language': locale,
        },
      });
      expect(result).toEqual(expectedProducts);
    });
  });
});
