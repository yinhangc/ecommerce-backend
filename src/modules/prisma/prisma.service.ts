import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { ListDataDto } from 'src/shared/dto/listData.dto';

// https://github.com/prisma/prisma/issues/6980
// #region - types
type ModelName = Prisma.ModelName;
type PrismaModelType<N extends ModelName = ModelName> =
  Prisma.TypeMap['model'][N];
type FindManyArgs<N extends ModelName> =
  PrismaModelType<N>['operations']['findMany']['args'];
type WhereInput<N extends ModelName = ModelName> = NonNullable<
  FindManyArgs<N>['where']
>;
// #endregion

@Injectable()
export class PrismaService extends PrismaClient {
  getWhere<T extends ModelName>(filter: ListDataDto['filter']): WhereInput<T> {
    console.log('getWhere', filter);
    const where = {};
    for (const [key, value] of Object.entries(filter)) {
      const isLike = key.search('LIKE_');
      const isEqual = key.search('EQUAL_');
      const isIn = key.search('IN_');
    }
    return where;
  }
}
