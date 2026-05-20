import express from "express";
import { AdminController } from "./admin.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

router.get("/users", auth(UserRole.ADMIN), AdminController.getUsers)
router.patch("/users/:id", auth(UserRole.ADMIN), AdminController.updateUserById)
router.get("/orders", auth(UserRole.ADMIN), AdminController.getAllOrders)
router.get("/provider-applications", auth(UserRole.ADMIN), AdminController.getProviderApplications)
router.patch("/provider-applications/:id/approve", auth(UserRole.ADMIN), AdminController.approveProviderApplication)
router.delete("/provider-applications/:id", auth(UserRole.ADMIN), AdminController.rejectProviderApplication)

export const AdminRoutes = router;
