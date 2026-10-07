import '../../integrations/ui.js';

import { CybersourceForm } from '../../integrations/cybersource/ui/CybersourceForm.js';
import { HipayForm } from '../../integrations/hipay/ui/HipayForm.js';
import { HipayPaypalButton } from '../../integrations/hipay-paypal/ui/HipayPaypalButton.js';
import { IxopayForm } from '../../integrations/ixopay/ui/IxopayForm.js';
import { WeChatQRView } from '../../integrations/wechat/ui/WeChatQRView.js';
import { PspProviders } from '../../types/PspProviders.js';
import { definePspProvider, getPspComponent } from './definePspProvider.js';

const Form = () => <div>form</div>;
const Button = () => <button>pay</button>;

describe('definePspProvider', () => {
  it('returns the definition and registers a form by default', () => {
    const definition = definePspProvider({ id: PspProviders.MUPLIFT, component: Form });

    expect(definition).toEqual({ id: PspProviders.MUPLIFT, component: Form });
    expect(getPspComponent(PspProviders.MUPLIFT)).toBe(Form);
    expect(getPspComponent(PspProviders.MUPLIFT, 'form')).toBe(Form);
  });

  it('keeps the form and the button of a provider apart', () => {
    definePspProvider({ id: PspProviders.MUPLIFT, component: Form });
    definePspProvider({ id: PspProviders.MUPLIFT, kind: 'button', component: Button });

    expect(getPspComponent(PspProviders.MUPLIFT)).toBe(Form);
    expect(getPspComponent(PspProviders.MUPLIFT, 'button')).toBe(Button);
  });

  it('replaces a provider declared twice', () => {
    const Replacement = () => null;

    definePspProvider({ id: PspProviders.MUPLIFT, component: Form });
    definePspProvider({ id: PspProviders.MUPLIFT, component: Replacement });

    expect(getPspComponent(PspProviders.MUPLIFT)).toBe(Replacement);
  });

  it('returns undefined for an unknown or missing provider', () => {
    expect(getPspComponent('UNKNOWN')).toBeUndefined();
    expect(getPspComponent(undefined)).toBeUndefined();
    expect(getPspComponent(PspProviders.M99BILLW, 'button')).toBeUndefined();
  });
});

describe('payment provider UIs', () => {
  it.each([
    [PspProviders.HIPAY, HipayForm],
    [PspProviders.MCYBERSOURCE, CybersourceForm],
    [PspProviders.EIXOPAY, IxopayForm],
    [PspProviders.M99BILLW, WeChatQRView],
  ])('registers the form of %s', (id, component) => {
    expect(getPspComponent(id)).toBe(component);
  });

  it('registers the PayPal button without replacing the HiPay form', () => {
    expect(getPspComponent(PspProviders.HIPAY_PAYPAL, 'button')).toBe(HipayPaypalButton);
    expect(getPspComponent(PspProviders.HIPAY_PAYPAL)).toBeUndefined();
    expect(getPspComponent(PspProviders.HIPAY, 'button')).toBeUndefined();
  });
});
