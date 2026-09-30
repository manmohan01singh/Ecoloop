import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createReview, getReviewsForUser, getMyReviews,
  getMyReceivedReviews, deleteReview, getReviewableUsers,
} from '../controllers/review.controller.js';

const router = Router();

// Public — browse reviewable users + fetch reviews for a specific user
router.get('/reviewable',          getReviewableUsers);
router.get('/:revieweeId',         getReviewsForUser);

// Authenticated
router.use(authenticate);
router.post('/',                   createReview);
router.get('/me/given',            getMyReviews);
router.get('/me/received',         getMyReceivedReviews);
router.delete('/:id',              deleteReview);

export default router;
