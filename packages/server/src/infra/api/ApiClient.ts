import { constant, injectable } from '@tsed/di';
import type { AxiosInstance, CreateAxiosDefaults } from 'axios';

import { HttpClient } from '../http/HttpClient.js';

export class ApiClient extends HttpClient {
  callee = 'API';

  baseURL = constant<string>('CLUBMED_API_URL', '');

  protected apiKey = constant<string>('API_KEY');

  protected callerHeader = constant<string>('AKAMAI_CALLER_HEADER', 'X-CLUBMED-CALLER');

  getLocales() {
    return this.get<string[]>('/v0/locales');
  }

  protected create(opts?: CreateAxiosDefaults): AxiosInstance {
    return super.create({
      ...opts,
      headers: {
        'x-api-key': this.apiKey,
        caller: this.callerHeader,
        ...opts?.headers,
      },
    });
  }
}

injectable(ApiClient);
