import { Controller, Inject } from '@tsed/di';
import { BodyParams, Context, PathParams, QueryParams } from '@tsed/platform-params';
import { PlatformViews } from '@tsed/platform-views';
import { Get, Post } from '@tsed/schema';

import { PaymentConfirmationService } from '../../../services/PaymentConfirmationService.js';

@Controller('/payment_redirect')
export class PaymentRedirectController {
  @Inject()
  protected paymentConfirmationService!: PaymentConfirmationService;

  @Inject()
  protected views!: PlatformViews;

  @Get('/:paymentId')
  @Post('/:paymentId')
  async redirect(
    @PathParams('paymentId') paymentId: string,
    @QueryParams() queryParams: Record<string, any>,
    @BodyParams() bodyParams: Record<string, any>,
    @Context() ctx: Context,
  ) {
    const params = { ...queryParams, ...bodyParams };
    const { locale, mode, ...redirectParams } = params;

    if (locale) {
      ctx.request.headers['accept-language'] = locale;
    }

    const redirectUrl = await this.paymentConfirmationService.handlePaymentRedirect(
      paymentId,
      redirectParams,
    );

    if (mode === 'iframe') {
      const html = await this.views.render('iframe-redirect.ejs', {
        redirectUrl,
      });

      ctx.response.contentType('text/html; charset=utf-8');
      ctx.response.setHeader(
        'Content-Security-Policy',
        "default-src 'none'; script-src 'unsafe-inline'; frame-ancestors 'self' https://*.clubmed.com",
      );

      return html;
    }

    return ctx.response.redirect(302, redirectUrl);
  }
}
