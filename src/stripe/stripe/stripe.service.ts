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

  async createCheckoutSession(): Promise<{ clientSecret: string }> {
    console.log('createCheckoutSession 1');
    const session = await this.stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price_data: {
            currency: 'hkd',
            product_data: {
              name: 'T-shirt',
              description: 'im a T-shirt',
              metadata: { dbId: 1 },
            },
            unit_amount: 5000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_method_types: ['alipay', 'card'],
      return_url: this.configService.get('STRIPE_PAYMENT_RETURN_URL'),
    });
    console.log('createCheckoutSession 2', session);
    return { clientSecret: session.client_secret };
  }
}
