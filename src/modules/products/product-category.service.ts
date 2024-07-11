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
    const { name, slug, parentId } = productCategoryDto;
    const data: Prisma.ProductCategoryCreateInput = {
      name,
      slug,
    };
    if (parentId)
      data.parent = {
        connect: {
          id: parentId,
        },
      };
    const category = await this.prisma.productCategory.create({
      data,
      include: {
        parent: true,
      },
    });
    console.log('create category', category);
    const createdParentId = category.parent?.id || null;
    delete category.parent;
    return {
      ...category,
      parentId: createdParentId,
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
    console.log(categories);
    return { rows: categories as ListWithParent, count };
  }

  async getAllForDropdown(): Promise<ProductCategoryDto[]> {
    const categories = await this.prisma.productCategory.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
    return categories;
  }

  async getById(id: number): Promise<ProductCategoryDto> {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: {
        parent: true,
      },
    });
    const parentId = category.parent?.id || null;
    delete category.parent;
    return {
      ...category,
      parentId,
    };
  }

  // TODO: update all children slug
  async update(
    id: number,
    productCategoryDto: ProductCategoryDto,
  ): Promise<ProductCategoryDto> {
    const { name, slug, parentId } = productCategoryDto;
    const data: Prisma.ProductCategoryUpdateInput = { name, slug };
    if (parentId)
      data.parent = {
        connect: {
          id: parentId,
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
    const updatedParentId = category.parent?.id || null;
    delete category.parent;
    return {
      ...category,
      parentId: updatedParentId,
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
