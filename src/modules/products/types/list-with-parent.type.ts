import { Prisma } from '@prisma/client';

export const listCategoryWithParent =
  Prisma.validator<Prisma.ProductCategoryFindManyArgs>()({
    include: {
      parent: true,
    },
  });

export type TListCategoryWithParent = Prisma.ProductCategoryGetPayload<
  typeof listCategoryWithParent
>[];
