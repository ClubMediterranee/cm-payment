import '../../integrations/index.js';

import hipay from '../../integrations/hipay/integration.config.js';
import { defineIntegration, getIntegrationConfig, getIntegrations } from './defineIntegration.js';

describe('defineIntegration', () => {
  it('returns the integration and registers it by id', () => {
    const integration = defineIntegration({
      id: 'test-psp',
      mountPoints: { cardNumber: 'test-psp-card-number' },
    });

    expect(integration.mountPoints.cardNumber).toBe('test-psp-card-number');
    expect(getIntegrationConfig('test-psp')).toBe(integration);
    expect(getIntegrations()).toContain(integration);
  });

  it('replaces an integration declared twice', () => {
    defineIntegration({ id: 'test-psp', mountPoints: { cvc: 'first' } });
    const latest = defineIntegration({ id: 'test-psp', mountPoints: { cvc: 'second' } });

    expect(getIntegrationConfig('test-psp')).toBe(latest);
    expect(getIntegrations().filter(({ id }) => id === 'test-psp')).toHaveLength(1);
  });

  it('returns undefined for an unknown integration', () => {
    expect(getIntegrationConfig('unknown')).toBeUndefined();
  });
});

describe('integrations', () => {
  const PSP_IDS = ['cybersource', 'hipay', 'hipay-paypal', 'ixopay', 'uplift'];

  it.each(PSP_IDS)('registers %s', (id) => {
    expect(getIntegrationConfig(id)?.id).toBe(id);
  });

  it('exposes the mount points expected by the PSP SDKs', () => {
    expect(getIntegrationConfig('hipay')).toBe(hipay);
    expect(hipay.mountPoints).toEqual({
      cardHolder: 'hipay-card-holder',
      cardNumber: 'hipay-card-number',
      expiryDate: 'hipay-card-expiry',
      cvc: 'hipay-card-cvc',
    });
    expect(getIntegrationConfig('cybersource')?.mountPoints).toEqual({
      cardNumber: 'cybersource-card-number',
      cvc: 'cybersource-card-cvc',
    });
    expect(getIntegrationConfig('ixopay')?.mountPoints).toEqual({
      cardNumber: 'number',
      cvc: 'cvv',
    });
    expect(getIntegrationConfig('hipay-paypal')?.mountPoints).toEqual({ button: 'paypal-button' });
    expect(getIntegrationConfig('uplift')?.mountPoints).toEqual({ container: 'uplift-container' });
  });

  it('never shares a mount point id between integrations', () => {
    const ids = PSP_IDS.flatMap((id) => Object.values(getIntegrationConfig(id)!.mountPoints));

    expect(new Set(ids).size).toBe(ids.length);
  });
});
