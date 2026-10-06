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

  it('returns an empty list when nothing is configured', async () => {
    repository.getAllowedOrigins.mockResolvedValue([]);
    const service = await create();

    expect(await service.getAllowedOrigins()).toEqual([]);
    expect(await service.isAllowed('https://host.example')).toBe(false);
  });

  it('merges Directus entries with the environment variable', async () => {
    repository.getAllowedOrigins.mockResolvedValue([
      'https://seller.example',
      'https://env.example',
    ]);
    const service = await create('https://env.example');

    expect(await service.getAllowedOrigins()).toEqual([
      'https://env.example',
      'https://seller.example',
    ]);
    expect(await service.isAllowed('https://Seller.example/')).toBe(true);
    expect(await service.isAllowed('https://other.example')).toBe(false);
    expect(await service.isAllowed(undefined)).toBe(false);
  });

  it('falls back to the environment variable when Directus is unavailable', async () => {
    repository.getAllowedOrigins.mockRejectedValue(new Error('403'));
    const service = await create('https://env.example');

    expect(await service.getAllowedOrigins()).toEqual(['https://env.example']);
  });
});
