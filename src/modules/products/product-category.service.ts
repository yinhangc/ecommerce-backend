import { Injectable } from '@nestjs/common';
import { ProductCategoryDto } from './dto/product-category.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ListDataDto } from 'src/shared/dto/list-data.dto';
import { TListCategoryWithParent, listCategoryWithParent } from './types';

@Injectable()
export class ProductCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(
    productCategoryDto: ProductCategoryDto,
  ): Promise<ProductCategoryDto> {
    return await this.prisma.$transaction(async (tx) => {
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
      const category = await tx.productCategory.create({
        data,
        include: {
          parent: true,
        },
      });
      const createdParentId = category.parent?.id || null;
      delete category.parent;
      return {
        ...category,
        parentId: createdParentId,
      };
    });
  }

  async list(
    query: ListDataDto,
  ): Promise<{ rows: TListCategoryWithParent; count: number }> {
    const { skip = 0, take = 10, filter = {}, orderBy = {} } = query;
    const where = this.prisma.getWhere<'ProductCategory'>(filter);
    const criteria: Prisma.ProductCategoryFindManyArgs = {
      skip,
      take,
      where,
      orderBy,
      include: listCategoryWithParent.include,
    };
    const [categories, count] = await this.prisma.$transaction([
      this.prisma.productCategory.findMany(criteria),
      this.prisma.productCategory.count({ where }),
    ]);
    return { rows: categories as TListCategoryWithParent, count };
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

  async update(
    id: number,
    productCategoryDto: ProductCategoryDto,
  ): Promise<ProductCategoryDto> {
    return await this.prisma.$transaction(async (tx) => {
      const { name, slug, parentId } = productCategoryDto;
      const data: Prisma.ProductCategoryUpdateInput = { name, slug };
      if (parentId)
        data.parent = {
          connect: {
            id: parentId,
          },
        };
      const category = await tx.productCategory.update({
        where: {
          id,
        },
        data,
        include: {
          parent: true,
          children: true,
        },
      });
      console.log('update category', category);
      // Update all children slug
      if (category.children.length > 0) {
        for (const child of category.children) {
          await tx.productCategory.update({
            where: { id: child.id },
            data: {
              slug: category.slug + '/' + child.slug.replace(/^\/[^\/]+\//, ''),
            },
          });
        }
      }
      delete category.parent;
      delete category.children;
      return {
        ...category,
        parentId,
      };
    });
  }

  async delete(id: number): Promise<void> {
    return await this.prisma.$transaction(async (tx) => {
      await tx.productCategory.delete({
        where: {
          id,
        },
      });
    });
  }
}
