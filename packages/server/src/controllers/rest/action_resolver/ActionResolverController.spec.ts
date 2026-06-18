import { Action } from '../../../infra/api/__generated__/index.js';
import { OidcIssuerTypes } from '../../../services/payment_config/types.js';
import { ActionResolverController } from './ActionResolverController.js';

describe('ActionResolverController', () => {
  let controller: ActionResolverController;
  let mockService: { resolveAction: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockService = { resolveAction: vi.fn() };
    controller = new ActionResolverController();
    Object.defineProperty(controller, 'actionResolverService', {
      get: () => mockService,
      configurable: true,
    });
  });

  it('delegates to the service and wraps the result', async () => {
    mockService.resolveAction.mockResolvedValue(Action.PAYMENT_PARTIAL);

    const result = await controller.resolveAction(
      'booking',
      'b-1',
      'fr-FR',
      OidcIssuerTypes.GM,
      'c-1',
      Action.PAYMENT_PARTIAL,
    );

    expect(mockService.resolveAction).toHaveBeenCalledWith({
      type: 'booking',
      id: 'b-1',
      customerId: 'c-1',
      action: Action.PAYMENT_PARTIAL,
      locale: 'fr-FR',
      issuerType: OidcIssuerTypes.GM,
    });
    expect(result).toEqual({ action: Action.PAYMENT_PARTIAL });
  });
});
