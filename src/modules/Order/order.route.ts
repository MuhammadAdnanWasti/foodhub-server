import express from 'express';
import { OrderController } from './order.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = express.Router();

router.post("/",auth(UserRole.CUSTOMER), OrderController.createOrder)
router.get("/",auth(UserRole.CUSTOMER), OrderController.getOrders)
router.get("/:id",auth(UserRole.CUSTOMER), OrderController.getOrderById)

export const OrderRoutes = router;
