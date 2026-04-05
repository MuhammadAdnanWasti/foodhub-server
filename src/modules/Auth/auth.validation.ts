import { z } from 'zod';

export const registerValidationSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(50),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    isProvider: z.boolean().optional().default(false),
    // Provider fields - optional unless isProvider is true
    restaurantName: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
}).refine(
    (data) => {
        // If registering as provider, these fields are required
        if (data.isProvider) {
            return data.restaurantName && data.address && data.phone;
        }
        return true;
    },
    {
        message: "Restaurant name, address, and phone are required when registering as provider",
        path: ["restaurantName"]
    }
);

export const loginValidationSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const authValidationSchema = {
    registerValidationSchema,
    loginValidationSchema
};