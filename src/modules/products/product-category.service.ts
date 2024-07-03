import { Injectable } from '@nestjs/common';
import { ProductCategoryDto } from './dto/product-category.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ListDataDto } from 'src/shared/dto/list-data.dto';
import { ListWithParent, listWithParent } from './types';

@Injectable()
export class ProductCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(
    productCategoryDto: ProductCategoryDto,
  ): Promise<ProductCategoryDto> {
    const { name, slug, parentCategoryId } = productCategoryDto;
    const data: Prisma.ProductCategoryCreateInput = {
      name,
      slug,
    };
    if (parentCategoryId)
      data.parent = {
        connect: {
          id: parentCategoryId,
        },
      };
    const category = await this.prisma.productCategory.create({
      data,
      include: {
        parent: true,
      },
    });
    console.log('create category', category);
    const createdParentCategoryId = category.parent?.id || null;
    delete category.parent;
    return {
      ...category,
      parentCategoryId: createdParentCategoryId,
    };
  }

  async list(
    query: ListDataDto,
  ): Promise<{ rows: ListWithParent; count: number }> {
    const { skip = 0, take = 10, filter = {}, orderBy = {} } = query;
    const where = this.prisma.getWhere<'ProductCategory'>(filter);
    const criteria: Prisma.ProductCategoryFindManyArgs = {
      skip,
      take,
      where,
      orderBy,
      include: listWithParent.include,
    };
    const [categories, count] = await this.prisma.$transaction([
      this.prisma.productCategory.findMany(criteria),
      this.prisma.productCategory.count({ where }),
    ]);
    return { rows: categories as ListWithParent, count };
  }

  async getAllForDropdown(): Promise<ProductCategoryDto[]> {
    return await this.prisma.productCategory.findMany();
  }

  async getById(id: number): Promise<ProductCategoryDto> {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: {
        parent: true,
      },
    });
    const parentCategoryId = category.parent?.id || null;
    delete category.parent;
    return {
      ...category,
      parentCategoryId,
    };
  }

  async update(
    id: number,
    productCategoryDto: ProductCategoryDto,
  ): Promise<ProductCategoryDto> {
    const { name, slug, parentCategoryId } = productCategoryDto;
    const data: Prisma.ProductCategoryUpdateInput = { name, slug };
    if (parentCategoryId)
      data.parent = {
        connect: {
          id: parentCategoryId,
        },
      };
    const category = await this.prisma.productCategory.update({
      where: {
        id,
      },
      data,
      include: {
        parent: true,
      },
    });
    console.log('update category', category);
    const updatedParentCategoryId = category.parent?.id || null;
    delete category.parent;
    return {
      ...category,
      parentCategoryId: updatedParentCategoryId,
    };
  }

  async delete(id: number): Promise<void> {
    await this.prisma.productCategory.delete({
      where: {
        id,
      },
    });
  }
}
