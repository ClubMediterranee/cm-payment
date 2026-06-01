import { useDecorators } from '@tsed/core';
import { Injectable } from '@tsed/di';
import { HeaderParams, UsePipe } from '@tsed/platform-params';
import type { PipeMethods } from '@tsed/schema';

import { DEFAULT_LOCALE } from '../services/payment_config/constants.js';

@Injectable()
export class LocalePipe implements PipeMethods<string | undefined, string> {
  transform(value: string | undefined): string {
    return value || DEFAULT_LOCALE;
  }
}

/**
 * Resolves the request locale from the `accept-language` header,
 * falling back to {@link DEFAULT_LOCALE} when absent.
 */
export function Locale(): ParameterDecorator {
  return useDecorators(HeaderParams('accept-language'), UsePipe(LocalePipe));
}
