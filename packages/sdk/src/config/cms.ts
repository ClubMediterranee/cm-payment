const CMS_URLS = {
  integ: 'https://cms.integ.clubmed.com',
  staging: 'https://digital-cms.staging.clubmed.com',
  prod: 'https://digital-cms.clubmed.com',
};

const sdkEnv = import.meta.env.VITE_SDK_ENV || 'prod';
export const CMS_URL = CMS_URLS[sdkEnv as keyof typeof CMS_URLS] || CMS_URLS.prod;
