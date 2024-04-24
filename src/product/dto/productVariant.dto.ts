import { IsOptional, Min } from 'class-validator';

export class ProductVariantDto {
  name: string;

  @Min(1)
  price: number;

  @Min(0)
  quantity: number;

  @IsOptional()
  sku: string;
}
