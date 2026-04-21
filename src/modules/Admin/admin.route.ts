import express from "express";
import { AdminController } from "./admin.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

router.get("/users", auth(UserRole.ADMIN), AdminController.getUsers)
router.patch("/users/:id", auth(UserRole.ADMIN), AdminController.updateUserById)
router.get("/orders", auth(UserRole.ADMIN), AdminController.getAllOrders)

export const AdminRoutes = router;
