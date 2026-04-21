import { prisma } from "../../lib/prisma";

const createOrder = async (payLoad: any, userId: string, mealId: string) => {
    // Validate mealId is provided
    if (!mealId) {
        throw new Error("Meal ID is required to create an order")
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
        where: { id: userId }
    })  
    if (!user) {
        throw new Error("User not found")
    }
    const meal = await prisma.meals.findUnique({
        where: { id: mealId }
    })  
    if (!meal) {
        throw new Error("Meal not found")
    }

  

    

    // Create meal with AUTO-SET providerId and categoryId
    const result = await prisma.orders.create({
        data: {  
            userId: user.id,
            providerId: meal.providerId,
            deliveryAddress: payLoad.deliveryAddress || "Not specified",
            status: payLoad.status,
            totalPrice: parseFloat(payLoad.totalPrice),
            orderItems: {
                create: {
                    mealId: payLoad.mealId,
                    quantity: payLoad.quantity,
                    unitPrice: meal.price
                }
            }
        },
        include: {
            orderItems: {
                include: {
                    meal: true
                }
            }
        }
    })
    
    return result;
}

interface CartItem {
    mealId: string;
    quantity: number;
}

interface CheckoutPayload {
    cartItems: CartItem[];
    deliveryAddress: string;
    providerId: string;
}

const checkoutCart = async (payload: CheckoutPayload, userId: string) => {
    // Validate user exists
    const user = await prisma.user.findUnique({
        where: { id: userId }
    })
    if (!user) {
        throw new Error("User not found")
    }

    // Validate provider exists
    const provider = await prisma.providerProfiles.findUnique({
        where: { id: payload.providerId }
    })
    if (!provider) {
        throw new Error("Provider not found")
    }

    // Fetch all meals and validate they exist and belong to the same provider
    const mealIds = payload.cartItems.map(item => item.mealId)
    const meals = await prisma.meals.findMany({
        where: {
            id: { in: mealIds }
        }
    })

    if (meals.length !== mealIds.length) {
        throw new Error("One or more meals not found")
    }

    // Verify all meals belong to the provided provider
    const allBelongToProvider = meals.every(meal => meal.providerId === payload.providerId)
    if (!allBelongToProvider) {
        throw new Error("All meals must belong to the same provider")
    }

    // Calculate total price
    let totalPrice = 0
    const orderItemsData: any[] = []
    
    payload.cartItems.forEach(item => {
        const meal = meals.find(m => m.id === item.mealId)
        if (meal) {
            totalPrice += meal.price * item.quantity
            orderItemsData.push({
                mealId: item.mealId,
                quantity: item.quantity,
                unitPrice: meal.price
            })
        }
    })

    // Create order with order items in transaction
    const order = await prisma.orders.create({
        data: {
            userId,
            providerId: payload.providerId,
            deliveryAddress: payload.deliveryAddress,
            status: "PLACED",
            totalPrice,
            orderItems: {
                create: orderItemsData
            }
        },
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

    return order
}

const getOrders = async (userId:string) => {
    const orders = await prisma.orders.findMany({
        where: {
            userId: userId
        },
        include: {
            user: true,
            provider: true,
            orderItems: {
                include: {
                    meal: true
                }
            }
        }
    });
    return orders;
};

const getOrderById = async (id: string, userId: string) => {
    const order = await prisma.orders.findUnique({
        where: { id },      
        include: {
            user: true,
            provider: true,
            orderItems: {
                include: {
                    meal: true
                }
            }
        }
    });
    
    if (order && order.userId !== userId) {
        throw new Error("You don't have permission to view this order")
    }
    
    return order;
}
export const OrderService = {
    // Add service methods here
    createOrder,
    checkoutCart,
    getOrders,
    getOrderById
    };