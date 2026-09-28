import { OidcIssuerTypes } from '@clubmed/caps';

export const isGM = (issuer?: string) => issuer === OidcIssuerTypes.GM;
export const isGO = (issuer?: string) => issuer === OidcIssuerTypes.GO;
export const isPartners = (issuer?: string) => issuer === OidcIssuerTypes.PARTNERS;
export const isSeller = (issuer?: string) => isGO(issuer) || isPartners(issuer);
