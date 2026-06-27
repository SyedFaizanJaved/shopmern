import { Router } from 'express';
import { listProductReviews, createReview } from '../controllers/review';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReviewSchema } from '../validation/review';

// mergeParams lets this router read :id from the parent mount
// path (/api/products/:id/reviews).
const router = Router({ mergeParams: true });

router.get('/', listProductReviews);
router.post('/', requireAuth, validate(createReviewSchema), createReview);

export default router;
