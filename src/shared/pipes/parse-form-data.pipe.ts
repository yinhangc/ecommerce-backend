import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { deepParseJson } from 'deep-parse-json';
import { merge, pick } from 'lodash';

type TParseFormDataOptions = {
  except?: string[];
};

@Injectable()
export class ParseFormDataPipe implements PipeTransform {
  constructor(private options?: TParseFormDataOptions) {}

  transform(value: any, _metadata: ArgumentMetadata) {
    const serializedValue = value;
    const originProperties = {};
    if (this.options?.except?.length > 0) {
      const { except } = this.options;
      merge(originProperties, pick(serializedValue, ...except));
    }
    const deserializedValue = deepParseJson(value);
    return { ...deserializedValue, ...originProperties };
  }
}
