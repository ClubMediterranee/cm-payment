import Cookies from 'js-cookie';

export const COOKIE_KEYS = {
  CALLBACK_URL: 'callback_url',
} as const;

export const setCookie = (key: string, value: string, expires = 1 / 48): void => {
  Cookies.set(key, value, {
    sameSite: 'none',
    secure: true,
    expires,
  });
};

export const getCookie = (key: string): string | undefined => {
  return Cookies.get(key);
};
