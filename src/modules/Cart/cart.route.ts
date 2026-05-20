import express from 'express';
import { CartController } from './cart.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = express.Router();

router.get("/", auth(UserRole.CUSTOMER), CartController.getMyCart);
router.post("/items", auth(UserRole.CUSTOMER), CartController.addItem);
router.patch("/items/:mealId", auth(UserRole.CUSTOMER), CartController.updateQuantity);
router.delete("/items/:mealId", auth(UserRole.CUSTOMER), CartController.removeItem);
router.delete("/", auth(UserRole.CUSTOMER), CartController.clearCart);

export const CartRoutes = router;
