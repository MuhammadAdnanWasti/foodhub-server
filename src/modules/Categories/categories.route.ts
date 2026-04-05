import express from 'express';
import { CategoriesController } from './categories.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = express.Router();

router.post("/",auth(UserRole.ADMIN), CategoriesController.createCategory)

export const CategoriesRoutes = router;
