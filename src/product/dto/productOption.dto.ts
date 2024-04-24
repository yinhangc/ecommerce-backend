import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

class ProductOptionValueDto {
  label: string;
}

export class ProductOptionDto {
  name: string;

  @ValidateNested({ each: true })
  @Type(() => ProductOptionValueDto)
  values: ProductOptionValueDto[];
}
