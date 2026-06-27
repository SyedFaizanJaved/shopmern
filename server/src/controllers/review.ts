import mongoose, { type HydratedDocument, type Types } from 'mongoose';
import type { Request, Response } from 'express';
import type { Review as ReviewDTO } from '@app/types';
import { Review, type IReview } from '../models/Review';
import { Product } from '../models/Product';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errors';
import type { CreateReviewInput } from '../validation/review';

interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
}

function serializeReview(r: HydratedDocument<IReview>): ReviewDTO {
  const doc = r as HydratedDocument<IReview> & { createdAt: Date; updatedAt: Date };
  const rawUser = r.user as unknown;

  let userId: string;
  let userName = '';
  if (rawUser && typeof rawUser === 'object' && 'name' in rawUser) {
    const pop = rawUser as PopulatedUser;
    userId = String(pop._id);
    userName = pop.name;
  } else {
    userId = String(rawUser);
  }

  return {
    id: r.id,
    product: String(r.product),
    user: userId,
    userName,
    rating: r.rating,
    comment: r.comment,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// The product's ratingAvg/ratingCount are DERIVED from its reviews. Recompute
// them with an aggregation so they always reflect the true set of reviews.
async function recomputeProductRating(productId: string): Promise<void> {
  const [stats] = await Review.aggregate<{ avg: number; count: number }>([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Product.updateOne(
    { _id: productId },
    {
      ratingAvg: stats ? Math.round(stats.avg * 10) / 10 : 0,
      ratingCount: stats ? stats.count : 0,
    },
  );
}

export const listProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await Review.find({ product: req.params.id })
    .populate('user', 'name') // join in the reviewer's name
    .sort({ createdAt: -1 });
  res.json(reviews.map(serializeReview));
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { rating, comment } = req.body as CreateReviewInput;
  const productId = req.params.id;

  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  let review: HydratedDocument<IReview>;
  try {
    review = await Review.create({ product: productId, user: req.user!.id, rating, comment });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      throw new AppError('You have already reviewed this product', 409);
    }
    throw err;
  }

  await recomputeProductRating(productId);
  await review.populate('user', 'name');
  res.status(201).json(serializeReview(review));
});
