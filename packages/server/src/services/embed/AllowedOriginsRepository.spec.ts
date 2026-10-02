import { PlatformTest } from '@tsed/platform-http/testing';

import { DirectusClient } from '../../infra/directus/DirectusClient.js';
import { AllowedOriginsRepository } from './AllowedOriginsRepository.js';

describe('AllowedOriginsRepository', () => {
  let repository: AllowedOriginsRepository;
  let directusClient: DirectusClient;

  beforeEach(async () => {
    await PlatformTest.create({
      DIRECTUS_URL: 'http://localhost',
      DIRECTUS_API_TOKEN: 'test-token',
      cache: { ttl: 300, store: 'memory' },
    });

    repository = PlatformTest.get<AllowedOriginsRepository>(AllowedOriginsRepository);
    directusClient = PlatformTest.get<DirectusClient>(DirectusClient);
  });

  afterEach(() => PlatformTest.reset());

  it('normalizes the published origins and keeps the known modes only', async () => {
    vi.spyOn(directusClient, 'getAllowedOrigins').mockResolvedValue([
      { origin: 'https://Seller.example/', modes: ['webcomponent'] },
      { origin: 'https://iframe.example', modes: ['iframe', 'unknown'] },
      { origin: 'https://nomodes.example', modes: null },
      { origin: 'invalid', modes: ['iframe'] },
    ]);

    expect(await repository.getAllowedOrigins()).toEqual([
      { origin: 'https://seller.example', modes: ['webcomponent'] },
      { origin: 'https://iframe.example', modes: ['iframe'] },
      { origin: 'https://nomodes.example', modes: [] },
    ]);
  });

  it('caches the Directus result with @UseCache', async () => {
    const getAllowedOrigins = vi
      .spyOn(directusClient, 'getAllowedOrigins')
      .mockResolvedValue([{ origin: 'https://a.example', modes: ['iframe'] }]);

    await repository.getAllowedOrigins();
    await repository.getAllowedOrigins();

    expect(getAllowedOrigins).toHaveBeenCalledTimes(1);
  });
});
