export const SERVER_VALIDATION_PROVIDERS = ["EIXOPAY"];
export const IFRAME_PROVIDERS = ["EIXOPAY"];
export const WITH_CONTACT_METHODS_PROVIDERS = ["EVOXPAY"];

export const Component_Key = {
  PaymentSchedule: Symbol("PaymentSchedule"),
  Cgv: Symbol("Cgv"),
  ContactChoice: Symbol("ContactChoice"),
  IframeProvider: Symbol("IframeProvider"),
  PaymentProviders: Symbol("PaymentProviders"),
};

export const Form_Pattern = {
  gm: [
    Component_Key.PaymentSchedule,
    Component_Key.Cgv,
    Component_Key.PaymentProviders,
    Component_Key.IframeProvider,
  ],
  go: [
    Component_Key.PaymentSchedule,
    Component_Key.Cgv,
    Component_Key.PaymentProviders,
    Component_Key.ContactChoice,
  ],
};
