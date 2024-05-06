import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

class ProductOptionValueDto {
  value: string;
}

export class ProductOptionDto {
  label: string;

  @ValidateNested({ each: true })
  @Type(() => ProductOptionValueDto)
  values: ProductOptionValueDto[];
}
