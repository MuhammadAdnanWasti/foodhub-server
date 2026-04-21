

import { z } from 'zod';

const createCategorySchema = z.object({
    name: z.string().min(2, "Category name must be at least 2 characters").max(100, "Category name must not exceed 100 characters"),
    description: z.string().min(5, "Description must be at least 5 characters").max(500, "Description must not exceed 500 characters")
});

const updateCategorySchema = z.object({
    name: z.string().min(2, "Category name must be at least 2 characters").max(100, "Category name must not exceed 100 characters").optional(),
    description: z.string().min(5, "Description must be at least 5 characters").max(500, "Description must not exceed 500 characters").optional()
}).refine((data) => data.name !== undefined || data.description !== undefined, {
    message: "At least one of name or description is required"
});

export const categoriesValidationSchema = {
    createCategorySchema,
    updateCategorySchema
};