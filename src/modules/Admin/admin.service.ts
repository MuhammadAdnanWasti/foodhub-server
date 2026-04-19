import { prisma } from "../../lib/prisma";
import type { Role, Status } from "../../../generated/prisma/client";

type UpdateUserRoleStatusPayload = {
    role?: Role;
    status?: Status;
};

const getUsersFromDB = async () => {
    const users = await prisma.user.findMany({
        omit: { password: true },
        include: {
            provider: true,
            orders: true,
            reviews: true,
        },
    });
    return users;
};

const updateUserRoleStatusInDB = async (
    userId: string,
    payload: UpdateUserRoleStatusPayload,
    adminUserId: string
) => {
    if (userId === adminUserId) {
        if (payload.role !== undefined && payload.role !== "ADMIN") {
            throw new Error("You cannot change your own role");
        }
        if (payload.status === "SUSPENDED") {
            throw new Error("You cannot suspend your own account");
        }
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
        throw new Error("User not found");
    }

    const data: { role?: Role; status?: Status } = {};
    if (payload.role !== undefined) {
        data.role = payload.role;
    }
    if (payload.status !== undefined) {
        data.status = payload.status;
    }

    return prisma.user.update({
        where: { id: userId },
        data,
        omit: { password: true },
        include: {
            provider: true,
            orders: true,
            reviews: true,
        },
    });
};

export const AdminService = {
    getUsersFromDB,
    updateUserRoleStatusInDB,
};
