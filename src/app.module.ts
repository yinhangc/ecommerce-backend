import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AzureBlobModule } from './azure-blob/azure-blob.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './products/product.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env.development' }),
    StripeModule.forRootAsync(),
    ProductModule,
    PrismaModule,
    AzureBlobModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
