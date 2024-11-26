const load = async ({ containerId, callbackUrl, id, type, locale }) => {
  window.document.getElementById(containerId).innerHTML =
    `<iframe title="payment-page" id="iframe" src="${import.meta.env.VITE_DOMAIN}/${type}/${id}/${locale}/?callback_url=${callbackUrl}" width="100%"></iframe>`;
  window.addEventListener("message", (event) => {
    if (event.origin === import.meta.env.VITE_DOMAIN) {
      if (event.data && event.data.type === "resize") {
        window.document.getElementById("iframe").style.height =
          `${event.data.data.height}px`;
      }
    }
  });
};

const submitCM = () => {
  window.document
    .getElementById("iframe")
    .contentWindow.postMessage({ type: "submit" }, import.meta.env.VITE_DOMAIN);
};

if (typeof window !== undefined) {
  window.loadCM = async ({ containerId, callbackUrl, id, type, locale }) =>
    await load({ containerId, callbackUrl, id, type, locale });
  window.submitCM = submitCM;
}
