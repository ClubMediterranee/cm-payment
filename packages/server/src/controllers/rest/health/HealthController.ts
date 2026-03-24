import { Controller } from '@tsed/di';
import { Get, Hidden } from '@tsed/schema';

@Controller('/health')
@Hidden()
export class HealthController {
  @Get('/')
  check() {
    return { status: 'OK' };
  }
}
