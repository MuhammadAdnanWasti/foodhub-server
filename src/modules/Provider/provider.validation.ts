import { z } from 'zod';

const applyProviderSchema = z.object({
    restaurantName: z.string().min(2, "Restaurant name is required"),
    address: z.string().min(5, "Address is required"),
    phone: z.string().min(5, "Phone is required"),
});

export const providerValidationSchema = {
    applyProviderSchema,
};