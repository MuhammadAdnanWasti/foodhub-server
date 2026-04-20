import { z } from 'zod';

export const reviewValidationSchema = {
    create: z.object({
        rating: z.number().int().min(1).max(5),
        comment: z.string().optional(),
        mealId: z.string()
    }),
    update: z.object({
        rating: z.number().int().min(1).max(5).optional(),
        comment: z.string().optional()
    })
};