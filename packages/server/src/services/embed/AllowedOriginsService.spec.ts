import { PlatformTest } from '@tsed/platform-http/testing';

import { AllowedOriginsRepository } from './AllowedOriginsRepository.js';
import { AllowedOriginsService } from './AllowedOriginsService.js';

describe('AllowedOriginsService', () => {
  const repository = { getAllowedOrigins: vi.fn() };

  async function create(envAllowedOrigins = '') {
    await PlatformTest.create({ CAPS_ALLOWED_ORIGINS: envAllowedOrigins });

    return PlatformTest.invoke<AllowedOriginsService>(AllowedOriginsService, [
      { token: AllowedOriginsRepository, use: repository },
    ]);
  }

  afterEach(async () => {
    repository.getAllowedOrigins.mockReset();
    await PlatformTest.reset();
  });

  it('returns empty lists when nothing is configured', async () => {
    repository.getAllowedOrigins.mockResolvedValue([]);
    const service = await create();

    expect(await service.getAllowedOrigins()).toEqual({ webcomponent: [], iframe: [] });
    expect(await service.isAllowed('https://host.example', 'webcomponent')).toBe(false);
  });

  it('merges Directus entries with the environment variable', async () => {
    repository.getAllowedOrigins.mockResolvedValue([
      { origin: 'https://seller.example', modes: ['webcomponent'] },
      { origin: 'https://iframe.example', modes: ['iframe'] },
    ]);
    const service = await create('https://env.example');

    expect(await service.getAllowedOrigins()).toEqual({
      webcomponent: ['https://env.example', 'https://seller.example'],
      iframe: ['https://env.example', 'https://iframe.example'],
    });
    expect(await service.isAllowed('https://Seller.example/', 'webcomponent')).toBe(true);
    expect(await service.isAllowed('https://seller.example', 'iframe')).toBe(false);
    expect(await service.isAllowed(undefined, 'iframe')).toBe(false);
  });

  it('falls back to the environment variable when Directus is unavailable', async () => {
    repository.getAllowedOrigins.mockRejectedValue(new Error('403'));
    const service = await create('https://env.example');

    expect(await service.getAllowedOrigins()).toEqual({
      webcomponent: ['https://env.example'],
      iframe: ['https://env.example'],
    });
  });
});
