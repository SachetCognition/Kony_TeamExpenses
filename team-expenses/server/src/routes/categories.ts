import { Router, Request, Response } from 'express';
import { CategoryService } from '../services/categoryService';
import prisma from '../lib/prisma';

const router = Router();
const categoryService = new CategoryService(prisma);

/** FR-015: GET /api/categories */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/** FR-015: POST /api/categories */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const category = await categoryService.createCategory({ name: name.trim(), description });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

/** FR-015: PUT /api/categories/:id */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const category = await categoryService.updateCategory(Number(req.params.id), { name, description });
    res.json(category);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
});

/** FR-015: DELETE /api/categories/:id */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await categoryService.deleteCategory(Number(req.params.id));
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
