class CMPayment {
  constructor({ containerId, onLoad, onLoadEnd }) {
    if (!containerId) {
      throw new Error("Container ID is required.");
    }

    this.domain = import.meta.env.VITE_DOMAIN;
    this.containerId = containerId;
    this.onLoad = onLoad;
    this.onLoadEnd = onLoadEnd;
    this.iframeId = "payment-iframe";

    window.addEventListener("message", this.handleMessage.bind(this));
  }

  load({ callbackUrl, id, type, locale, issuer }) {
    const src = `${this.domain}/${issuer}/${type}/${id}/${locale}/?callback_url=${callbackUrl}`;
    const container = document.getElementById(this.containerId);

    if (!container) {
      throw new Error(`Container with id "${this.containerId}" not found`);
    }
    const iframe = document.createElement("iframe");
    iframe.title = "payment-page";
    iframe.id = this.iframeId;
    iframe.sandbox = "allow-scripts allow-forms allow-same-origin";
    iframe.src = src;
    iframe.width = "100%";
    iframe.height = "1024px";
    iframe.style.border = "none";
    container.appendChild(iframe);
  }

  submit() {
    const iframe = document.getElementById(this.iframeId);

    if (!iframe) {
      throw new Error("Iframe not loaded. Call `load()` before `submit()`.");
    }

    iframe.contentWindow.postMessage({ type: "submit" }, this.domain);
  }

  handleMessage(event) {
    if (event.origin !== this.domain) {
      console.warn("Received message from unauthorized origin:", event.origin);
      return;
    }

    const { type, data } = event.data;

    switch (type) {
      case "resize":
        const iframe = document.getElementById(this.iframeId);
        if (iframe) {
          iframe.style.height = `${data.height}px`;
        }
        break;
      case "loaded":
        this.onLoad && this.onLoad();
        break;
      case "loaded_end":
        this.onLoadEnd && this.onLoadEnd();
        break;
      default:
        console.warn("Unhandled message type:", type);
    }
  }
}

if (typeof window !== "undefined") {
  window.CMPayment = CMPayment;
}
