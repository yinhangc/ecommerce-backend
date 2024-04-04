import { Controller, Post } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Post('/create-checkout-session')
  async createCheckoutSession(): Promise<{ clientSecret: string }> {
    const res = await this.stripeService.createCheckoutSession();
    return res;
  }
}
