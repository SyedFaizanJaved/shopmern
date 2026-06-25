import { Router } from 'express';
import { createOrder, listMyOrders, getMyOrderById } from '../controllers/order';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { checkoutSchema } from '../validation/order';

const router = Router();

router.post('/', requireAuth, validate(checkoutSchema), createOrder);
router.get('/', requireAuth, listMyOrders);
router.get('/:id', requireAuth, getMyOrderById);

export default router;
