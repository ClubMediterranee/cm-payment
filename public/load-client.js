class r {
  constructor({ containerId: e, onLoad: i, onLoadEnd: n }) {
    if (!e) throw new Error("Container ID is required.");
    (this.domain = "https://cm-payment:5173"),
      (this.containerId = e),
      (this.onLoad = i),
      (this.onLoadEnd = n),
      (this.iframeId = "payment-iframe"),
      window.addEventListener("message", this.handleMessage.bind(this));
  }
  load({ callbackUrl: e, id: i, type: n, locale: o, issuer: s }) {
    const d = `${this.domain}/${s}/${n}/${i}/${o}/?callback_url=${e}`,
      a = document.getElementById(this.containerId);
    if (!a)
      throw new Error(`Container with id "${this.containerId}" not found`);
    this.onLoad && this.onLoad();
    const t = document.createElement("iframe");
    (t.title = "payment-page"),
      (t.id = this.iframeId),
      (t.sandbox = "allow-scripts allow-forms allow-same-origin"),
      (t.src = d),
      (t.width = "100%"),
      (t.height = "1024px"),
      (t.style.border = "none"),
      a.appendChild(t);
  }
  submit() {
    const e = document.getElementById(this.iframeId);
    if (!e)
      throw new Error("Iframe not loaded. Call `load()` before `submit()`.");
    e.contentWindow.postMessage({ type: "submit" }, this.domain);
  }
  handleMessage(e) {
    if (e.origin !== this.domain) {
      console.warn("Received message from unauthorized origin:", e.origin);
      return;
    }
    const { type: i, data: n } = e.data;
    switch (i) {
      case "resize":
        const o = document.getElementById(this.iframeId);
        o && (o.style.height = `${n.height}px`);
        break;
      case "loaded":
        this.onLoad && this.onLoad();
        break;
      case "loaded_end":
        this.onLoadEnd && this.onLoadEnd();
        break;
      default:
        console.warn("Unhandled message type:", i);
    }
  }
}
typeof window < "u" && (window.CMPayment = r);
