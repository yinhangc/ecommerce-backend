import { Injectable } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { find } from 'lodash';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ProductDto } from './dto/product.dto';
import { ListDataDto } from 'src/shared/dto/listData.dto';

// #region - types defintion
const listWithSkus = Prisma.validator<Prisma.ProductFindManyArgs>()({
  include: {
    skus: {
      select: {
        sku: true,
        price: true,
      },
    },
  },
});
type ListWithSkus = Prisma.ProductGetPayload<typeof listWithSkus>[];
// #endregion

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(productDto: ProductDto) {
    // await this.prisma.product.deleteMany({});
    await this.prisma.$transaction(async (tx) => {
      await this._upsert(tx, null, productDto);
    });
  }

  async list(
    query: ListDataDto,
  ): Promise<{ rows: ListWithSkus; count: number }> {
    const { skip = 0, take = 10, filter = {}, orderBy = {} } = query;
    const where = this.prisma.getWhere<'Product'>(filter);
    const criteria: Prisma.ProductFindManyArgs = {
      skip,
      take,
      where,
      include: listWithSkus.include,
      orderBy,
    };
    const [products, count] = await this.prisma.$transaction([
      this.prisma.product.findMany(criteria),
      this.prisma.product.count({ where }),
    ]);
    return { rows: products as ListWithSkus, count };
  }

  async getById(id: number): Promise<ProductDto> {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        images: true,
        options: {
          include: {
            values: true,
          },
        },
        skus: {
          include: {
            values: {
              include: {
                option: true,
              },
            },
          },
        },
      },
    });
    if (!product) return null;
    const { name, description, status, options, images, skus } = product;
    const productDto: ProductDto = {
      id,
      name,
      description,
      status,
      options,
      imageUrls: images.map((im) => im.imageUrl),
      variants: skus.map((sku) => {
        const { id, sku: skuLabel, price, values } = sku;
        return {
          id,
          name: values.map((v) => v.value).join(' / '),
          price: Number(price),
          quantity: 0,
          options: values.map((v) => ({
            label: v.option.label,
            value: v.value,
          })),
          sku: skuLabel,
        };
      }),
    };
    return productDto;
  }

  async updateById(id: number, productDto: ProductDto): Promise<string> {
    await this.prisma.$transaction(async (tx) => {
      await this._upsert(tx, id, productDto);
    });
    return 'SUCCESS';
  }

  private async _upsert(tx, id: number, productDto: ProductDto): Promise<void> {
    console.log('PRODUCT DTO', productDto);
    const { name, description, status, imageUrls, options, variants } =
      productDto;
    const product = await tx.product.upsert({
      where: { id: id || 0 },
      create: {
        name,
        description,
        status: ProductStatus[status],
        images: {
          create: imageUrls.map((imageUrl) => ({
            imageUrl,
          })),
        },
        options: {
          create: options.map((option) => {
            return {
              label: option.label,
              values: {
                create: option.values.map((v) => ({
                  value: v.value,
                })),
              },
            };
          }),
        },
      },
      update: {
        name,
        description,
        status: ProductStatus[status],
        images: {
          deleteMany: {},
          create: imageUrls.map((imageUrl) => ({
            imageUrl,
          })),
        },
        options: {
          deleteMany: {},
          create: options.map((option) => {
            return {
              label: option.label,
              values: {
                create: option.values.map((v) => ({
                  value: v.value,
                })),
              },
            };
          }),
        },
        skus: {
          deleteMany: {},
        },
      },
      include: {
        options: {
          include: {
            values: true,
          },
        },
      },
    });
    for (const variant of variants) {
      const { price, sku, options: variantOptions } = variant;
      const productOptionValues = [];
      let generatedSku = `${product.id.toString()}`;
      for (const variantOption of variantOptions) {
        const productOption = find(product.options, {
          label: variantOption.label,
        });
        const productOptionValueId = find(productOption.values, {
          value: variantOption.value,
        }).id;
        productOptionValues.push({ id: productOptionValueId });
        if (!sku)
          generatedSku +=
            productOption.id.toString() + productOptionValueId.toString();
      }
      const productSku = await tx.productSku.create({
        data: {
          sku: sku || generatedSku,
          price,
          product: {
            connect: { id: product.id },
          },
          values: {
            connect: productOptionValues,
          },
        },
        include: {
          values: true,
        },
      });
      console.log('prisma sku', JSON.stringify(productSku, null, 2));
    }
  }
}
