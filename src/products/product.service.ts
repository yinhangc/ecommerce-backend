import { Injectable } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { cloneDeep, find } from 'lodash';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductDto } from './dto/product.dto';
@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(productDto: ProductDto) {
    await this.prisma.product.deleteMany({});
    return this.prisma.$transaction(async (tx) => {
      await this._create(tx, productDto);
    });
  }

  private async _create(tx, productDto: ProductDto): Promise<void> {
    console.log('productDto', productDto);
    const { name, description, status, images, options, variants } = productDto;
    const product = await tx.product.create({
      data: {
        name,
        description,
        status: ProductStatus[status],
        // images: {
        //   create: images,
        // },
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
      include: {
        options: {
          include: {
            values: true,
          },
        },
      },
    });
    console.log('prisma product', JSON.stringify(product, null, 2));
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

  async getById(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
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
    const productDto: Partial<ProductDto> = cloneDeep(product);
    productDto.variants = product.skus.map((sku) => {
      const { sku: skuLabel, price, values } = sku;
      return {
        name: values.map((v) => v.value).join(' / '),
        price: Number(price),
        quantity: 0,
        options: values.map((v) => ({
          label: v.option.label,
          value: v.value,
        })),
        sku: skuLabel,
      };
    });
    console.log('productDto', JSON.stringify(productDto, null, 2));
    return productDto;
  }
}
