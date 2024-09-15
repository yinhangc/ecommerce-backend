import { Prisma } from '@prisma/client';

export const listProductWithSkus =
  Prisma.validator<Prisma.ProductFindManyArgs>()({
    include: {
      skus: {
        select: {
          sku: true,
          price: true,
        },
      },
    },
  });
export type TListProductWithSkus = Prisma.ProductGetPayload<
  typeof listProductWithSkus
>[];
