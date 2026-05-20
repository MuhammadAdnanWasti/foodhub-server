import express from 'express';
import { OrderController } from './order.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = express.Router();

router.post("/", auth(UserRole.CUSTOMER), OrderController.createOrder)
router.post("/checkout", auth(UserRole.CUSTOMER), OrderController.checkoutCart)
router.post("/checkout-from-cart", auth(UserRole.CUSTOMER), OrderController.checkoutCartFromDb)
router.get("/", auth(UserRole.CUSTOMER), OrderController.getOrders)
router.get("/:id", auth(UserRole.CUSTOMER), OrderController.getOrderById)
router.patch("/:id/cancel", auth(UserRole.CUSTOMER), OrderController.cancelOrder)

export const OrderRoutes = router;
