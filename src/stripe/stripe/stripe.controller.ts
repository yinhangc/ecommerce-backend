import { Controller, Post } from '@nestjs/common';

@Controller('stripe')
export class StripeController {
  @Post('/create-checkout-session')
  async createCheckoutSession(): Promise<void> {
    console.log('createCheckoutSession');
  }
}
