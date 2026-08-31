import { useWatchedPaymentProvider } from './useWatchedPaymentProvider';

export const useProviderIntegrationMode = () => {
  const provider = useWatchedPaymentProvider();
  const displayType = provider?.configuration?.display_type;

  return {
    iframe: displayType === 'iframe' || displayType === 'third_party_iframe',
    thirdPartyIframe: displayType === 'third_party_iframe',
    redirect: displayType === 'redirect',
    hostedField: displayType === 'hosted_field',
    custom: displayType === 'custom',
  };
};
