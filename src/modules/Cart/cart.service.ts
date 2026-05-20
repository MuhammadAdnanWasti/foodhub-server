import { prisma } from "../../lib/prisma";

const getOrCreateCart = async (userId: string) => {
    let cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    meal: {
                        include: {
                            provider: true,
                            category: true,
                        },
                    },
                },
            },
        },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId },
            include: {
                items: {
                    include: {
                        meal: {
                            include: {
                                provider: true,
                                category: true,
                            },
                        },
                    },
                },
            },
        });
    }

    return cart;
};

const getMyCart = async (userId: string) => {
    return getOrCreateCart(userId);
};

const addItem = async (userId: string, mealId: string) => {
    const meal = await prisma.meals.findUnique({ where: { id: mealId } });
    if (!meal) throw new Error("Meal not found");

    const cart = await getOrCreateCart(userId);

    // Enforce single-provider rule
    if (cart.items.length > 0) {
        const existingProviderId = cart.items[0].meal.providerId;
        if (existingProviderId !== meal.providerId) {
            throw new Error(
                "Your cart already contains items from a different restaurant. Please clear your cart first."
            );
        }
    }

    const existingItem = await prisma.cartItem.findUnique({
        where: { cartId_mealId: { cartId: cart.id, mealId } },
    });

    if (existingItem) {
        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + 1 },
        });
    } else {
        await prisma.cartItem.create({
            data: { cartId: cart.id, mealId, quantity: 1 },
        });
    }

    return getOrCreateCart(userId);
};

const updateQuantity = async (userId: string, mealId: string, quantity: number) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error("Cart not found");

    const item = await prisma.cartItem.findUnique({
        where: { cartId_mealId: { cartId: cart.id, mealId } },
    });
    if (!item) throw new Error("Item not in cart");

    if (quantity <= 0) {
        await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
        await prisma.cartItem.update({
            where: { id: item.id },
            data: { quantity },
        });
    }

    return getOrCreateCart(userId);
};

const removeItem = async (userId: string, mealId: string) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error("Cart not found");

    const item = await prisma.cartItem.findUnique({
        where: { cartId_mealId: { cartId: cart.id, mealId } },
    });
    if (!item) throw new Error("Item not in cart");

    await prisma.cartItem.delete({ where: { id: item.id } });
    return getOrCreateCart(userId);
};

const clearCart = async (userId: string) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error("Cart not found");

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return getOrCreateCart(userId);
};

export const CartService = {
    getMyCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
};
