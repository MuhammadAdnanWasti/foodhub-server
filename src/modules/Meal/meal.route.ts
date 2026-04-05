import express from 'express';
import { MealController } from './meal.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = express.Router();

router.post("/",auth(UserRole.PROVIDER), MealController.createMeal)
router.get("/", MealController.getMeals)
router.get("/:id", MealController.getMealById)

export const MealRoutes = router;
