import { Controller, Inject } from '@tsed/di';
import { BodyParams, Context, PathParams, QueryParams } from '@tsed/platform-params';
import { PlatformViews } from '@tsed/platform-views';
import { Get, Hidden, Post, Returns, Summary } from '@tsed/schema';

import { Locale } from '../../../decorators/Locale.js';
import {
  PaymentlessBody,
  PaymentRedirectQuery,
  PaymentRedirectResultModel,
} from '../../../services/payment_redirect/models.js';
import { PaymentRedirectService } from '../../../services/payment_redirect/PaymentRedirectService.js';

@Controller('/payment_redirect')
export class PaymentRedirectController {
  @Inject()
  protected paymentRedirectService!: PaymentRedirectService;

  @Inject()
  protected views!: PlatformViews;

  @Post('/paymentless')
  @Summary('Confirm a booking without an online payment and return the confirmation redirect')
  @Returns(200, PaymentRedirectResultModel)
  async paymentless(
    @BodyParams() body: PaymentlessBody,
    @Locale() locale: string,
  ): Promise<PaymentRedirectResultModel> {
    const redirectUrl = await this.paymentRedirectService.confirmBookingWithoutPayment(
      body.booking_id,
      { ...body, locale },
    );

    return { url: redirectUrl, method: 'GET' };
  }

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

    const redirectUrl = await this.paymentRedirectService.handlePaymentRedirect(paymentId, {
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
