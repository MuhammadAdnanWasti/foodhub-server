import { MAX_UPLOAD_SIZE } from '../../constants';
// import { z } from 'zod';

import { z } from 'zod';

export const createOrderValidationSchema = z.object({
    quantity: z.number().int().positive("Quantity must be a positive number"),
    status: z.string().optional(),
    totalPrice: z.string().or(z.number()).refine((val) => parseFloat(String(val)) > 0, "Total price must be greater than 0"),
    mealId: z.string().min(1, "Meal ID is required")
});

export const orderValidationSchema = {
    createOrderValidationSchema
};