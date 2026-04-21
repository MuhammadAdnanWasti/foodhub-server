import express from 'express';
import { CategoriesController } from './categories.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = express.Router();

router.get("/", CategoriesController.getCategories)
router.post("/", auth(UserRole.ADMIN), CategoriesController.createCategory)
router.patch("/:id", auth(UserRole.ADMIN), CategoriesController.updateCategory)
router.delete("/:id", auth(UserRole.ADMIN), CategoriesController.deleteCategory)

export const CategoriesRoutes = router;
