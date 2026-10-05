/**
 * Ids of the elements where the PSP SDKs mount their UI (hosted fields, buttons, widgets).
 * The PSPs look them up from the global `document`: inside a shadow root they are rendered in the light DOM
 * of the shadow host (see `usePspMountPoint`).
 */
export const PSP_MOUNT_POINTS = Object.freeze({
  hipay: {
    cardHolder: 'hipay-card-holder',
    cardNumber: 'hipay-card-number',
    expiryDate: 'hipay-card-expiry',
    cvc: 'hipay-card-cvc',
  },
  hipayPaypal: {
    button: 'paypal-button',
  },
  cybersource: {
    cardNumber: 'cybersource-card-number',
    cvc: 'cybersource-card-cvc',
  },
  ixopay: {
    cardNumber: 'number',
    cvc: 'cvv',
  },
  uplift: {
    container: 'uplift-container',
  },
} as const);

export type PspName = keyof typeof PSP_MOUNT_POINTS;

/**
 * Every mount point id, to generate or inspect the expected elements.
 */
export const PSP_MOUNT_POINT_IDS: readonly string[] = Object.freeze(
  Object.values(PSP_MOUNT_POINTS).flatMap((mountPoints) => Object.values(mountPoints)),
);
