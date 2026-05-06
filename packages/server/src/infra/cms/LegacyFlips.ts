import { CMS_PREFIXES } from '../../services/payment_config/constants.js';
import { OidcIssuerTypes } from '../../services/payment_config/types.js';

export class LegacyFlips {
  constructor(
    private readonly flips: Record<string, boolean>,
    private readonly issuerType: OidcIssuerTypes,
    private readonly locale: string,
  ) {}

  getValue(key: string): boolean {
    const isSeller = [OidcIssuerTypes.GO, OidcIssuerTypes.PARTNERS].includes(this.issuerType);
    const sellerPrefix = isSeller ? CMS_PREFIXES.SELLER : '';

    const candidates = [
      `${CMS_PREFIXES.OVERRIDE}${this.locale}.${CMS_PREFIXES.FEATURE_FLIPPING}${sellerPrefix}${key}`,
      `${CMS_PREFIXES.FEATURE_FLIPPING}${sellerPrefix}${key}`,
    ];

    for (const candidate of candidates) {
      if (candidate in this.flips) {
        return this.flips[candidate];
      }
    }

    return false;
  }

  getKeys(): string[] {
    return Object.keys(this.flips);
  }
}
