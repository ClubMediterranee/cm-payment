import Cookies from "js-cookie";

export function setCallbackUrl(callbackUrl?: string) {

  if (callbackUrl) {
    Cookies.set("callback_url", callbackUrl, {
      sameSite: "none",
      secure: true,
      expires: 1 / 48,
    });
  }
}

export function getCallbackUrl() {
  return Cookies.get("callback_url");
}

export function setCustomerId(customerId?: string) {
  if (customerId) {
    Cookies.set("customer_id", customerId, {
      sameSite: "none",
      secure: true,
    });
  }
}