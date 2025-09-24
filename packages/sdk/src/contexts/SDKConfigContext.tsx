import {createContext} from "react";
import {Action} from "@clubmed/payment-sdk/__generated__/index.js";
import type {ClubMedApiSettings, OidcSettings, SDKOptions} from "@clubmed/payment-sdk/types/SDKOptions.js";

export const SDKConfigContext = createContext<SDKOptions>({
  action: Action.PAYMENT_RESA as Action,
  url: "",
  proposalId: "",
  bookingId: "",
  customerId: "",
  locale: navigator.language || "en-US",
  oidc: undefined as unknown as OidcSettings,
  api: undefined as unknown as ClubMedApiSettings,
  callbackUrl: ""
});