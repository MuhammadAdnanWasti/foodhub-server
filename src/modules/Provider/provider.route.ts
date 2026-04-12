import express from 'express';
import { ProviderController } from './provider.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = express.Router();

router.get("/", ProviderController.getAllProviders)
router.patch("/orders/:id", auth(UserRole.PROVIDER), ProviderController.updateOrderStatusById)
router.get("/:id", ProviderController.getProviderById)
export const ProviderRoutes = router;
