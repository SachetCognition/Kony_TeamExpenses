import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoryService } from '../../src/services/categoryService';

const mockPrisma = {
  category: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
} as any;

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CategoryService(mockPrisma);
  });

  // TC-U-019: createCategory with valid data
  it('TC-U-019: creates category with valid data', async () => {
    const mockCat = { id: 1, name: 'Food', description: 'Meals' };
    mockPrisma.category.create.mockResolvedValue(mockCat);

    const result = await service.createCategory({ name: 'Food', description: 'Meals' });
    expect(result).toEqual(mockCat);
    expect(mockPrisma.category.create).toHaveBeenCalledWith({
      data: { name: 'Food', description: 'Meals' },
    });
  });

  // TC-U-020: updateCategory by PK
  it('TC-U-020: updates category by PK', async () => {
    const mockCat = { id: 1, name: 'Updated', description: 'New desc' };
    mockPrisma.category.update.mockResolvedValue(mockCat);

    const result = await service.updateCategory(1, { name: 'Updated', description: 'New desc' });
    expect(result).toEqual(mockCat);
    expect(mockPrisma.category.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { name: 'Updated', description: 'New desc' },
    });
  });

  // TC-U-021: deleteCategory by PK
  it('TC-U-021: deletes category by PK', async () => {
    mockPrisma.category.delete.mockResolvedValue({ id: 1 });

    await service.deleteCategory(1);
    expect(mockPrisma.category.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  // TC-U-022: getAllCategories returns all records
  it('TC-U-022: returns all categories', async () => {
    const cats = [
      { id: 1, name: 'Food' },
      { id: 2, name: 'Travel' },
    ];
    mockPrisma.category.findMany.mockResolvedValue(cats);

    const result = await service.getAllCategories();
    expect(result).toHaveLength(2);
  });
});
