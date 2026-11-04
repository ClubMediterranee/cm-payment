import { useDecorators } from '@tsed/core';
import { Injectable } from '@tsed/di';
import { BadRequest } from '@tsed/exceptions';
import { HeaderParams, UsePipe } from '@tsed/platform-params';
import type { PipeMethods } from '@tsed/schema';

import { OidcIssuerTypes } from '../services/payment_config/types.js';

const VALID_ISSUER_TYPES = Object.values(OidcIssuerTypes);

@Injectable()
export class IssuerTypePipe implements PipeMethods<string | undefined, OidcIssuerTypes> {
  transform(value: string | undefined): OidcIssuerTypes {
    if (!value) {
      return OidcIssuerTypes.GM;
    }

    if (!VALID_ISSUER_TYPES.includes(value as OidcIssuerTypes)) {
      throw new BadRequest(
        `Invalid issuer type: "${value}". Valid values are: ${VALID_ISSUER_TYPES.join(', ')}`,
      );
    }

    return value as OidcIssuerTypes;
  }
}

/**
 * Resolves and validates the OIDC issuer type from the `x-issuer-type` header.
 * Defaults to {@link OidcIssuerTypes.GM} when absent, throws {@link BadRequest} when invalid.
 */
export function IssuerType(): ParameterDecorator {
  return useDecorators(HeaderParams('x-issuer-type'), UsePipe(IssuerTypePipe));
}
