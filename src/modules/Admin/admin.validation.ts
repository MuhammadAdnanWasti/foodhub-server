import { z } from "zod";

const roleEnum = z.enum(["CUSTOMER", "PROVIDER", "ADMIN"]);
const statusEnum = z.enum(["ACTIVE", "SUSPENDED"]);

export const adminUpdateUserSchema = z
    .object({
        role: roleEnum.optional(),
        status: statusEnum.optional(),
    })
    .refine((data) => data.role !== undefined || data.status !== undefined, {
        message: "At least one of role or status is required",
    });

export const adminValidationSchema = {
    adminUpdateUserSchema,
};
