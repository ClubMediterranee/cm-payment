import { setFetchOptions } from "./fetcher";

class PaymentSDK {
  setFetchOptions(options: {
    apiKey?: string;
    getAccessToken?: () => string;
    locale?: string;
  }) {
    setFetchOptions(options);
  }
}

export const paymentSDK = new PaymentSDK();
