import express from 'express';
import { ProviderController } from './provider.controller';

const router = express.Router();

router.get("/:id", ProviderController.getProviderById)
router.get("/", ProviderController.getAllProviders)
export const ProviderRoutes = router;
