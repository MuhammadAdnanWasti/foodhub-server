import { MAX_UPLOAD_SIZE } from '../../constants';
// import { z } from 'zod';

import { z } from 'zod';

export const createOrderValidationSchema = z.object({
    quantity: z.number().int().positive("Quantity must be a positive number"),
    status: z.string().optional(),
    totalPrice: z.string().or(z.number()).refine((val) => parseFloat(String(val)) > 0, "Total price must be greater than 0"),
    mealId: z.string().min(1, "Meal ID is required")
});

export const cartItemSchema = z.object({
    mealId: z.string().uuid("Invalid meal ID format"),
    quantity: z.number().int().positive("Quantity must be a positive number")
});

export const checkoutRequestSchema = z.object({
    cartItems: z.array(cartItemSchema).min(1, "Cart must contain at least one item"),
    deliveryAddress: z.string().min(5, "Delivery address must be at least 5 characters").max(255, "Delivery address must not exceed 255 characters"),
    providerId: z.string().uuid("Invalid provider ID format")
});

export const orderValidationSchema = {
    createOrderValidationSchema,
    cartItemSchema,
    checkoutRequestSchema
};