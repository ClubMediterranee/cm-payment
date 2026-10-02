import { CollectionOf, Integer, Property, Required } from '@tsed/schema';

export type EmbedMode = 'webcomponent' | 'iframe';

export type AllowedOrigin = {
  origin: string;
  modes: EmbedMode[];
};

/**
 * Must match `CAPS_PROTOCOL_VERSION` from `@clubmed/caps` (`packages/sdk/src/embed/shared/protocol.ts`).
 */
export const EMBED_PROTOCOL_VERSION = 1;

export enum EmbedFlowType {
  BOOKING = 'booking',
  PROPOSAL = 'proposal',
}

export class EmbedAllowedOrigins {
  @Required()
  @CollectionOf(String)
  webcomponent!: string[];

  @Required()
  @CollectionOf(String)
  iframe!: string[];
}

export class EmbedConfig {
  @Required()
  @Property()
  apiUrl!: string;

  @Required()
  @Property()
  apiKey!: string;

  @Required()
  @Property(EmbedAllowedOrigins)
  allowedOrigins!: EmbedAllowedOrigins;

  @Required()
  @Integer()
  protocolVersion!: number;
}
