import express from 'express';
import { ReviewController } from './review.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = express.Router();

router.post("/", auth(UserRole.CUSTOMER), ReviewController.createReview);
router.get("/", ReviewController.getReviews);
router.get("/:id", ReviewController.getReviewById);
router.get("/meal/:mealId", ReviewController.getReviewsByMeal);
router.get("/user/:userId", ReviewController.getReviewsByUser);
router.put("/:id", auth(UserRole.CUSTOMER), ReviewController.updateReviewById);
router.delete("/:id", auth(UserRole.CUSTOMER), ReviewController.deleteReviewById);

export const ReviewRoutes = router;