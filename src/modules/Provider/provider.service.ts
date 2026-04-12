import { OrderStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
const getAllProviders = async () => {
    const meals = await prisma.providerProfiles.findMany({
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
            meals: true          

        }
    });
    return provider;
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
        include: { meal: true }
    })
    if (!existing) {
        throw new Error("Order not found")
    }
    if (existing.meal.providerId !== providerProfile.id) {
        throw new Error("You are not authorized to update this order")
    }
    return prisma.orders.update({
        where: { id: orderId },
        data: { status }
    })
}
export const ProviderService = {
    // Add service methods here
    getProviderById,
    getAllProviders,
    updateOrderStatusById
    };