import express from 'express';
import { MealController } from './meal.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = express.Router();

router.post("/provider",auth(UserRole.PROVIDER), MealController.createMeal)
router.put("/provider/:id",auth(UserRole.PROVIDER), MealController.updateMealById)
router.delete("/provider/:id",auth(UserRole.PROVIDER), MealController.deleteMealById)
router.get("/", MealController.getMeals)
router.get("/:id", MealController.getMealById)

export const MealRoutes = router;
