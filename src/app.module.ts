import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AzureBlobModule } from './modules/azure-blob/azure-blob.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ProductModule } from './modules/products/product.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env.development' }),
    StripeModule.forRootAsync(),
    ProductModule,
    PrismaModule,
    AzureBlobModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
