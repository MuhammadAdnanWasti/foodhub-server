import { z } from 'zod';

const addItemSchema = z.object({
    mealId: z.string().uuid("Invalid meal ID format"),
});

const updateQuantitySchema = z.object({
    quantity: z.number().int().min(0, "Quantity must be 0 or more"),
});

export const cartValidationSchema = {
    addItemSchema,
    updateQuantitySchema,
};
