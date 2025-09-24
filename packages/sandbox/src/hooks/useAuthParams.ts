import {OidcIssuerTypes} from "@clubmed/payment-sdk/types/SDKOptions";
import {z} from "zod";
import {useRoute} from "wouter";
import {User} from "oidc-client-ts";
import {AppSettings} from "../config.js";

const ParamsSchema = z.object({
  issuer: z.enum([
    OidcIssuerTypes.GM,
    OidcIssuerTypes.GO,
    OidcIssuerTypes.PARTNERS
  ]).optional(),
  // id: z.string().regex(/[0-9]+/).optional(),
  // type: z.enum(["booking", "proposal"]).optional(),
  // customer_id: z.string().regex(/[0-9]+/).optional(),
  // locale: z.string().regex(/[a-z]{2}-[A-Z]{2}/).optional(),
});

// type AppQueryParams = z.infer<typeof ParamsSchema>;

export function useAuthParams() {
  const url = import.meta.env.VITE_DOMAIN || window.location.origin

  const [isMatch, result] = useRoute<{ id: string; issuer: OidcIssuerTypes, type: string }>("/:issuer/*");

  // const {
  //   locale,
  //   customer_id,
  // } = useQueryParams<Pick<AppQueryParams, "locale" | "customer_id">>();

  const initialValues = {
    issuer: result?.issuer?.toUpperCase(),
  }

  // meaning it's a valid URL to trigger the payment Flow
  if (isMatch) {
    if (!ParamsSchema.safeParse(initialValues).success) {
      throw new Error("Invalid parameters in URL");
    }
  }

  function onSigninCallback(u: User | undefined) {
    if (u) {

      const {return_url} = u.state as { return_url: string };

      window.location.href = return_url;
    }
  }

  return {
    url,
    initialValues,
    oidc: {
      issuerType: initialValues.issuer as OidcIssuerTypes,
      ...AppSettings.oidc[initialValues.issuer as OidcIssuerTypes],
    },
    onSigninCallback
  }
}
