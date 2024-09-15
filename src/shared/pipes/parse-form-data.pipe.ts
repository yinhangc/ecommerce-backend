import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { deepParseJson } from 'deep-parse-json';

type TParseFormDataOptions = {
  except?: string[];
};

@Injectable()
export class ParseFormDataPipe implements PipeTransform {
  constructor(private dtoClass: any) {}

  transform(value: any, _metadata: ArgumentMetadata) {
    const deserializedValue = deepParseJson(value);
    const dtoInstance = plainToInstance(
      this.dtoClass,
      deserializedValue,
    ) as object;
    const errors = validateSync(dtoInstance);
    if (errors.length > 0) {
      throw new Error('Validation failed');
    }
    return dtoInstance;
  }
}
