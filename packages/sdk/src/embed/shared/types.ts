import type { CSSProperties, ReactNode } from 'react';

/**
 * CAPS deployment environment. Each environment maps to a CAPS server origin (see `CAPS_ENV_URLS`).
 */
export type CapsEnv = 'integration' | 'staging' | 'production';

/**
 * Issuer of the payment flow. Values are identical to the SDK `OidcIssuerTypes` enum.
 */
export type CapsIssuerType = 'GM' | 'GO' | 'PARTNERS';

export type CapsFlowType = 'booking' | 'proposal';

export type CapsEmbedErrorCode =
  | 'REMOTE_LOAD_FAILED'
  | 'PROTOCOL_MISMATCH'
  | 'REACT_VERSION_UNSUPPORTED'
  | 'AUTH_REQUIRED'
  | 'ORIGIN_NOT_ALLOWED'
  | 'FLOW_ERROR';

export type CapsEmbedError = {
  code: CapsEmbedErrorCode;
  message: string;
};

/**
 * Regions of the CAPS form that the host can render elsewhere in its page (webcomponent mode).
 */
export type CapsFormSlotName = 'donation' | 'submit';

export type CapsFormSlots = Partial<Record<CapsFormSlotName, HTMLElement>>;

export type CapsEnvSelector = {
  /**
   * Target CAPS environment. Defaults to `production`.
   */
  env?: CapsEnv;
  /**
   * Explicit CAPS server URL. Takes precedence over `env` (local dev, preview environments).
   */
  url?: string;
};

type CapsFlowBase = {
  type: CapsFlowType;
  /**
   * Booking or proposal identifier.
   */
  id: string;
  /**
   * Locale formatted as `xx-XX`. Defaults to `navigator.language`, then `fr-FR`.
   */
  locale?: string;
  callbackUrl: string;
  callbackUrlSeller?: string;
  action?: string;
  reference?: string;
  uuid?: string;
};

/**
 * Parameters identifying a CAPS payment flow. `customerId` is required for sellers (GO, PARTNERS).
 */
export type CapsFlowParams =
  | (CapsFlowBase & { issuerType: 'GM'; customerId?: string })
  | (CapsFlowBase & { issuerType: 'GO' | 'PARTNERS'; customerId: string });

export type CapsFormCallbacks = {
  /**
   * Called once the flow is interactive.
   */
  onReady?: () => void;
  /**
   * Mirrors the payment processing state.
   */
  onLoadingChange?: (loading: boolean) => void;
  onError?: (error: CapsEmbedError) => void;
  /**
   * Called before any top-level navigation. Return `false` to handle the navigation yourself.
   */
  onRedirect?: (url: string) => void | false;
};

export type CapsFormProps = CapsFlowParams &
  CapsEnvSelector &
  CapsFormCallbacks & {
    /**
     * Access token provided by the host. Never written to the DOM nor to a URL.
     */
    accessToken?: string;
    /**
     * Content (labels) overrides. Must be JSON serializable.
     */
    content?: Record<string, unknown>;
    className?: string;
    style?: CSSProperties;
    /**
     * Rendered while the CAPS form is loading.
     */
    fallback?: ReactNode;
  };
