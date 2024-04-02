import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @Inject('STRIPE_API_KEY') private readonly apiKey: string,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.apiKey);
  }

  async createCheckoutSession() {
    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'hkd',
            product_data: {
              name: 'T-shirt',
              description: '',
              metadata: { dbId: '' },
            },
            unit_amount: 1,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: this.configService.get('STRIPE_PAYMENT_SUCCESS_URL'),
      cancel_url: this.configService.get('STRIPE_PAYMENT_FAILURE_URL'),
    });
    console.log('session url', session.url);
  }
}
