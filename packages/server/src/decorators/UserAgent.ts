import { useDecorators } from '@tsed/core';
import { HeaderParams } from '@tsed/platform-params';

export function UserAgent(): ParameterDecorator {
  return useDecorators(HeaderParams('user-agent'));
}
