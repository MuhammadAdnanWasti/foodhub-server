import { OrderStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
const getAllProviders = async () => {
    const meals = await prisma.providerProfiles.findMany({
        where: { user: { role: "PROVIDER" } },
        include: {
            meals: true,
            user: true
        }
    });
    return meals;
};

const getProviderById = async (id: string) => {
    const provider = await prisma.providerProfiles.findUnique({
        where: { id },
        include: {
            meals: {
                include: {
                    category: true,
                    reviews: {
                        include: {
                            user: { select: { id: true, name: true } },
                        },
                    },
                },
            },
        },
    });
    return provider;
}

type ApplyProviderPayload = {
    restaurantName: string;
    address: string;
    phone: string;
};

const applyToBecomeProvider = async (userId: string, payload: ApplyProviderPayload) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role !== "CUSTOMER") {
        throw new Error("Only customers can apply to become a provider");
    }

    const existing = await prisma.providerProfiles.findUnique({ where: { userId } });
    if (existing) {
        throw new Error("You already have a pending application");
    }

    const application = await prisma.providerProfiles.create({
        data: {
            userId,
            restaurantName: payload.restaurantName,
            address: payload.address,
            phone: payload.phone,
        },
    });

    return application;
};

const getProviderOrders = async (userId: string | undefined) => {
    if (!userId) {
        throw new Error("Authentication required")
    }

    // Get provider profile linked to authenticated user
    const providerProfile = await prisma.providerProfiles.findUnique({
        where: { userId: userId }
    })
    if (!providerProfile) {
        throw new Error("Provider profile not found")
    }

    // Get all orders for this provider
    const orders = await prisma.orders.findMany({
        where: {
            providerId: providerProfile.id
        },
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
    })

    return orders
}

const updateOrderStatusById = async (orderId: string, status: OrderStatus, userId: string | undefined) => {
    if (!userId) {
        throw new Error("Authentication required")
    }
    const user = await prisma.user.findUnique({
        where: { id: userId }
    })
    if (!user) {
        throw new Error("User not found")
    }
    const providerProfile = await prisma.providerProfiles.findUnique({
        where: { userId: userId }
    })
    if (!providerProfile) {
        throw new Error("Provider profile not found. Only providers can update order status.")
    }
    const existing = await prisma.orders.findUnique({
        where: { id: orderId },
        include: { orderItems: true }
    })
    if (!existing) {
        throw new Error("Order not found")
    }
    if (existing.providerId !== providerProfile.id) {
        throw new Error("You are not authorized to update this order")
    }
    return prisma.orders.update({
        where: { id: orderId },
        data: { status },
        include: {
            orderItems: {
                include: {
                    meal: true
                }
            },
            user: true,
            provider: true
        }
    })
}
export const ProviderService = {
    getProviderById,
    getAllProviders,
    getProviderOrders,
    updateOrderStatusById,
    applyToBecomeProvider,
};