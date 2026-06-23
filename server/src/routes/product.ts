import { Router } from 'express';
import {
  listProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product';
import { validate } from '../middleware/validate';
import { requireAuth, requireRole } from '../middleware/auth';
import { createProductSchema, updateProductSchema } from '../validation/product';

const router = Router();

// Public reads.
router.get('/', listProducts);
router.get('/:slug', getProductBySlug);

// Admin-only writes: requireAuth (who are you?) → requireRole (are you admin?)
// → validate (is the body valid?) → controller.
router.post('/', requireAuth, requireRole('admin'), validate(createProductSchema), createProduct);
router.put('/:id', requireAuth, requireRole('admin'), validate(updateProductSchema), updateProduct);
router.delete('/:id', requireAuth, requireRole('admin'), deleteProduct);

export default router;
