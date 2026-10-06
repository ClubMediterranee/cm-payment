import { CollectionOf, Integer, Property, Required } from '@tsed/schema';

/**
 * Must match `CAPS_PROTOCOL_VERSION` from `@clubmed/caps` (`packages/sdk/src/embed/shared/protocol.ts`).
 */
export const EMBED_PROTOCOL_VERSION = 1;

export enum EmbedFlowType {
  BOOKING = 'booking',
  PROPOSAL = 'proposal',
}

export class EmbedConfig {
  @Required()
  @Property()
  apiUrl!: string;

  @Required()
  @Property()
  apiKey!: string;

  /**
   * Host origins allowed to embed the CAPS form.
   */
  @Required()
  @CollectionOf(String)
  allowedOrigins!: string[];

  @Required()
  @Integer()
  protocolVersion!: number;
}
