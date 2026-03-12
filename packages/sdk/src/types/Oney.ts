export type OneyPopinOptions = {
  payment_amount: number;
  country: string;
  language: string;
  merchant_guid: string;
  filter_by: string;
  filters: {
    payment_method: string;
    payment_method_type: string;
    payment_mode: string;
    is_free: string;
    with_down_payment: string;
  }[];
  hide_logo: boolean;
};

export type OneyMerchantApp = {
  loadSimulationPopin: (config: { options: OneyPopinOptions }) => void;
};

declare global {
  interface Window {
    oneyMerchantApp?: OneyMerchantApp;
    loadOneyWidget?: (callback: () => void) => void;
  }
}
