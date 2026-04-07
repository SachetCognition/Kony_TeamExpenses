import { PrismaClient } from '@prisma/client';

export class CategoryService {
  constructor(private prisma: PrismaClient) {}

  /** FR-015: Get all categories */
  async getAllCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /** FR-015: Create category */
  async createCategory(data: { name: string; description?: string }) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        description: data.description || null,
      },
    });
  }

  /** FR-015: Update category */
  async updateCategory(id: number, data: { name?: string; description?: string }) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  /** FR-015: Delete category */
  async deleteCategory(id: number) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
