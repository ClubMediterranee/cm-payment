import { PlatformTest } from '@tsed/platform-http/testing';

import { AllowedOriginsService } from '../../../services/embed/AllowedOriginsService.js';
import { EmbedFlowType } from '../../../services/embed/models.js';
import { OidcIssuerTypes } from '../../../services/payment_config/types.js';
import { EmbedConfigController } from './EmbedConfigController.js';

describe('EmbedConfigController', () => {
  let controller: EmbedConfigController;

  async function create(settings: Record<string, string> = {}) {
    await PlatformTest.create({
      BASE_URL: 'https://staging.caps.api.clubmed/',
      CAPS_API_KEY_GM_BE: 'gm-be',
      CAPS_API_KEY_GM_CA: 'gm-ca',
      CAPS_API_KEY_GO: 'go',
      CAPS_API_KEY_PARTNERS: 'partners',
      ...settings,
    });

    controller = await PlatformTest.invoke<EmbedConfigController>(EmbedConfigController, [
      {
        token: AllowedOriginsService,
        use: {
          getAllowedOrigins: vi.fn().mockResolvedValue(['https://host.example']),
        },
      },
    ]);
  }

  afterEach(() => PlatformTest.reset());

  it.each([
    [OidcIssuerTypes.GM, EmbedFlowType.BOOKING, 'gm-ca'],
    [OidcIssuerTypes.GM, EmbedFlowType.PROPOSAL, 'gm-be'],
    [OidcIssuerTypes.GO, EmbedFlowType.PROPOSAL, 'go'],
    [OidcIssuerTypes.PARTNERS, EmbedFlowType.BOOKING, 'partners'],
  ])('resolves the API key for %s %s', async (issuerType, type, apiKey) => {
    await create();

    expect(await controller.getConfig(issuerType, type)).toEqual({
      apiUrl: 'https://staging.caps.api.clubmed',
      apiKey,
      allowedOrigins: ['https://host.example'],
      protocolVersion: 1,
    });
  });

  it('falls back to the request host when BASE_URL is not set', async () => {
    await create({ BASE_URL: '' });

    const config = await controller.getConfig(
      OidcIssuerTypes.GM,
      EmbedFlowType.BOOKING,
      'caps.example',
      'internal:8083',
    );

    expect(config.apiUrl).toBe('https://caps.example');
    expect(
      (await controller.getConfig(OidcIssuerTypes.GM, EmbedFlowType.BOOKING, undefined, 'internal'))
        .apiUrl,
    ).toBe('https://internal');
    expect((await controller.getConfig(OidcIssuerTypes.GM, EmbedFlowType.BOOKING)).apiUrl).toBe('');
  });
});
