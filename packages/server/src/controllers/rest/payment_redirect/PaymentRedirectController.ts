import { Controller, Inject } from '@tsed/di';
import { BodyParams, Context, PathParams, QueryParams } from '@tsed/platform-params';
import { PlatformViews } from '@tsed/platform-views';
import { AdditionalProperties, Get, Hidden, Post, Property, Summary } from '@tsed/schema';

import { PaymentConfirmationService } from '../../../services/payment_confirmation/PaymentConfirmationService.js';

@AdditionalProperties(true)
class PaymentRedirectQuery {
  @Property()
  callback_url?: string;

  @Property()
  proposal_id?: string;

  @Property()
  provider_id?: string;

  @Property()
  locale?: string;

  @Property()
  mode?: string;

  [key: string]: any;
}

@Controller('/payment_redirect')
export class PaymentRedirectController {
  @Inject()
  protected paymentConfirmationService!: PaymentConfirmationService;

  @Inject()
  protected views!: PlatformViews;

  @Get('/:paymentId')
  @Post('/:paymentId')
  @Hidden()
  @Summary('Handle payment provider redirect after payment')
  async redirect(
    @PathParams('paymentId') paymentId: string,
    @QueryParams() queryParams: PaymentRedirectQuery,
    @BodyParams() bodyParams: Record<string, any>,
    @Context() ctx: Context,
  ) {
    const params = { ...queryParams, ...bodyParams };
    const { locale, mode, ...redirectParams } = params;

    if (locale) {
      ctx.request.headers['accept-language'] = locale;
    }

    const redirectUrl = await this.paymentConfirmationService.handlePaymentRedirect(paymentId, {
      ...redirectParams,
      locale,
    });

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
