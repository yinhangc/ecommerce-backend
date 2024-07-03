import { Prisma } from '@prisma/client';

export const listWithSkus = Prisma.validator<Prisma.ProductFindManyArgs>()({
  include: {
    skus: {
      select: {
        sku: true,
        price: true,
      },
    },
  },
});
export type ListWithSkus = Prisma.ProductGetPayload<typeof listWithSkus>[];

export const listWithParent =
  Prisma.validator<Prisma.ProductCategoryFindManyArgs>()({
    include: {
      parent: true,
    },
  });
export type ListWithParent = Prisma.ProductCategoryGetPayload<
  typeof listWithParent
>[];
