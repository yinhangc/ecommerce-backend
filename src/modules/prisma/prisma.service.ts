import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { unflatten } from 'safe-flat';
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
    let where = {};
    for (const [key, value] of Object.entries(filter)) {
      if (key.includes('LIKE_')) {
        where = {
          ...where,
          ...unflatten({ [`${key.replace('LIKE_', '')}.contains`]: value }),
        };
      } else if (key.includes('EQUAL_')) {
        where = {
          ...where,
          ...unflatten({ [`${key.replace('EQUAL_', '')}.equals`]: value }),
        };
      } else if (key.includes('IN_')) {
        where = {
          ...where,
          ...unflatten({ [`${key.replace('IN_', '')}.has`]: value }),
        };
      }
    }
    console.log('getWhere WHERE', where);
    return where;
  }
}
