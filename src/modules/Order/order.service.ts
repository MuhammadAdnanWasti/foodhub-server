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
            quantity: payLoad.quantity,
            status: payLoad.status,
            totalPrice: parseFloat(payLoad.totalPrice),
          
            userId: user.id,              // AUTO-SET from user lookup
            mealId  : payLoad.mealId
        }
    })
    
    return result;
}

const getOrders = async (userId:string) => {
    const meals = await prisma.orders.findMany({
        where: {
            userId: userId
        },
        include: {
            user: true,
            meal: true
        }
    });
    return meals;
};

const getOrderById = async (id: string, userId: string) => {
    const order = await prisma.orders.findUnique({
        where: { id },      
        include: {
            user: true,
            meal: true          

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
    getOrders,
    getOrderById
    };