import Cookies from 'js-cookie';

type COOKIE_KEYS = 'callback_url';

export const setCookie = (key: COOKIE_KEYS, value: string, expires = 1 / 48): void => {
  Cookies.set(key, value, {
    sameSite: 'none',
    secure: true,
    expires,
  });
};

export const getCookie = (key: COOKIE_KEYS): string | undefined => {
  return Cookies.get(key);
};
