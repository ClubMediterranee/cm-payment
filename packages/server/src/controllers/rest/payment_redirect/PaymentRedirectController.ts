import { Controller } from '@tsed/di';
import { Context } from '@tsed/platform-params';
import { Get, Post } from '@tsed/schema';

@Controller('/payment_redirect')
export class PaymentRedirectController {
  // protected readonly paymentService = inject(PaymentService);

  @Post('/')
  @Get('/')
  redirect(@Context() ctx: Context) {
    return ctx.response.redirect(302, 'https://www.clubmed.com/');
  }
}
