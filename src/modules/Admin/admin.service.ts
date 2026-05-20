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

const getAllOrders = async () => {
    const orders = await prisma.orders.findMany({
        include: {
            user: true,
            provider: true,
            orderItems: {
                include: {
                    meal: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return orders;
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

const getProviderApplications = async () => {
    return prisma.providerProfiles.findMany({
        where: { user: { role: "CUSTOMER" } },
        include: {
            user: { omit: { password: true } },
        },
        orderBy: { createdAt: "desc" },
    });
};

const approveProviderApplication = async (profileId: string) => {
    const profile = await prisma.providerProfiles.findUnique({
        where: { id: profileId },
        include: { user: true },
    });

    if (!profile) {
        throw new Error("Application not found");
    }
    if (profile.user.role !== "CUSTOMER") {
        throw new Error("Not a pending application");
    }

    return prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
            where: { id: profile.userId },
            data: { role: "PROVIDER" },
            omit: { password: true },
            include: { provider: true },
        });
        return updatedUser;
    });
};

const rejectProviderApplication = async (profileId: string) => {
    const profile = await prisma.providerProfiles.findUnique({
        where: { id: profileId },
        include: { user: true },
    });

    if (!profile) {
        throw new Error("Application not found");
    }
    if (profile.user.role !== "CUSTOMER") {
        throw new Error("Cannot reject an already-approved provider");
    }

    await prisma.providerProfiles.delete({ where: { id: profileId } });
    return { message: "Application rejected and removed" };
};

export const AdminService = {
    getUsersFromDB,
    getAllOrders,
    updateUserRoleStatusInDB,
    getProviderApplications,
    approveProviderApplication,
    rejectProviderApplication,
};
