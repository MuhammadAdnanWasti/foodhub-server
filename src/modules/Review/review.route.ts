import express from 'express';
import { ReviewController } from './review.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = express.Router();

router.post("/", auth(UserRole.CUSTOMER), ReviewController.createReview);
router.get("/", ReviewController.getReviews);
router.get("/me", auth(UserRole.CUSTOMER), ReviewController.getMyReviews);
router.get("/meal/:mealId", ReviewController.getReviewsByMeal);
router.get("/provider/:providerId", ReviewController.getReviewsByProvider);
router.get("/user/:userId", ReviewController.getReviewsByUser);
router.get("/:id", ReviewController.getReviewById);
router.put("/:id", auth(UserRole.CUSTOMER), ReviewController.updateReviewById);
router.delete("/:id", auth(UserRole.CUSTOMER), ReviewController.deleteReviewById);

export const ReviewRoutes = router;