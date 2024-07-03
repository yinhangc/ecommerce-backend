import { Injectable } from '@nestjs/common';
import { Prisma, ProductImage, ProductStatus } from '@prisma/client';
import { difference, find } from 'lodash';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ListDataDto } from 'src/shared/dto/list-data.dto';
import { AzureBlobService } from '../azure-blob/azure-blob.service';
import { ProductDto } from './dto/product.dto';
import { ListWithSkus, listWithSkus } from './types';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private azureBlobService: AzureBlobService,
  ) {}

  async create(productDto: ProductDto): Promise<ProductDto> {
    // await this.prisma.product.deleteMany({});
    const productId = await this.prisma.$transaction(async (tx) => {
      return await this._upsertWithTransaction(tx, productDto);
    });
    return await this.getById(productId);
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
      orderBy,
      include: listWithSkus.include,
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
    let sasToken: string;
    if (images.length > 0) {
      sasToken = await this.azureBlobService.createContainerSas(
        this.getContainerName(id),
      );
    }
    const productDto: ProductDto = {
      id,
      name,
      description,
      status,
      options,
      images: images.map((im) => `${im.url}?${sasToken}`),
      variants: skus.map((sku) => {
        const { id, sku: skuLabel, price, values } = sku;
        return {
          id,
          name:
            values.length > 0
              ? values.map((v) => v.value).join(' / ')
              : 'DEFAULT',
          // TODO: Investigate why is string
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

  async updateById(id: number, productDto: ProductDto): Promise<ProductDto> {
    await this.prisma.$transaction(async (tx) => {
      return await this._upsertWithTransaction(tx, productDto);
    });
    return await this.getById(id);
  }

  private async _upsertWithTransaction(
    tx,
    productDto: ProductDto,
  ): Promise<number> {
    const { id, name, description, status, images, options, variants } =
      productDto;
    // upsert product without images and skus
    const product = await tx.product.upsert({
      // TODO: fix this
      where: { id: Number(id) || 0 },
      create: {
        name,
        description,
        status: ProductStatus[status],
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
        images: true,
      },
    });
    // as product id is needed for generated sku, create product skus only after product is upserted
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
      await tx.productSku.create({
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
    }
    // update image
    await this._updateImagesWithTransaction(
      tx,
      product.id,
      product.status,
      images,
      product.images,
    );
    return product.id;
  }

  private async _updateImagesWithTransaction(
    tx,
    productId: number,
    productStatus: ProductStatus,
    images: (string | Express.Multer.File)[],
    existingImages: ProductImage[],
  ): Promise<void> {
    const containerName = this.getContainerName(productId);
    const imageBlobs = images.filter(
      (im) => typeof im !== 'string',
    ) as Express.Multer.File[];
    let updatedImageUrls = images.filter(
      (im) => typeof im === 'string',
    ) as string[];
    // remove sas token from url if any
    updatedImageUrls = updatedImageUrls.map((im) => im.split('?sv=')[0]);
    // delete removed files from azure blob
    const existingImageUrls = existingImages.map((im) => im.url);
    const removedImageUrls = difference(existingImageUrls, updatedImageUrls);
    if (removedImageUrls.length > 0) {
      const removedImages = existingImages.filter((im) =>
        removedImageUrls.includes(im.url),
      );
      await this.azureBlobService.deleteFiles(
        containerName,
        removedImages.map((im) => im.blobName),
      );
    }
    // upload non-existing images to azure blob
    const uploadFilesRes =
      imageBlobs.length > 0
        ? await this.azureBlobService.uploadFiles(
            imageBlobs,
            containerName,
            productStatus === ProductStatus.INACTIVE ? 'blob' : null,
          )
        : [];
    // update db
    await tx.product.update({
      where: { id: productId },
      data: {
        images: {
          deleteMany: { url: { in: removedImageUrls } },
          createMany: { data: uploadFilesRes },
        },
      },
      include: { images: true },
    });
  }

  private getContainerName(productId: number) {
    return 'product' + productId.toString();
  }
}
