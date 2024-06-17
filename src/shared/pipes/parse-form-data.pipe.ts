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
    // console.log('BEFORE PARSE', value);
    const serializedValue = value;
    const originProperties = {};
    if (this.options?.except?.length > 0) {
      const { except } = this.options;
      merge(originProperties, pick(serializedValue, ...except));
    }
    const deserializedValue = deepParseJson(value);
    // console.log('AFTER PARSE', { ...deserializedValue, ...originProperties });
    return { ...deserializedValue, ...originProperties };
  }
}
