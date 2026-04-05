import { prisma } from "../../lib/prisma"

const createMealInfoDB = async (payLoad: any, userId: string) => {
    // Validate user exists
    const user = await prisma.user.findUnique({
        where: { id: userId }
    })  
    if (!user) {
        throw new Error("User not found")
    }

    // Get the provider profile for this user
    const providerProfile = await prisma.providerProfiles.findUnique({
        where: { userId: userId }
    });

    if (!providerProfile) {
        throw new Error("Provider profile not found. Only providers can create meals.")
    }

    // Validate that categoryName is provided
    if (!payLoad.categoryName) {
        throw new Error("Category name is required")
    }

    // Automatically find the category by name
    const category = await prisma.categories.findUnique({
        where: { name: payLoad.categoryName }
    });

    if (!category) {
        throw new Error(`Category "${payLoad.categoryName}" not found. Please create the category first.`)
    }

    // Validate required meal fields
    if (!payLoad.name || !payLoad.description || !payLoad.price || !payLoad.image) {
        throw new Error("Name, description, price, and image are required")
    }

    // Create meal with AUTO-SET providerId and categoryId
    const result = await prisma.meals.create({
        data: {  
            name: payLoad.name,
            description: payLoad.description,
            price: parseFloat(payLoad.price),
            image: payLoad.image,
            categoryId: category.id,              // AUTO-SET from category lookup
            providerId: providerProfile.id        // AUTO-SET from provider profile
        },
        include: {
            category: true,
            provider: true
        }
    })
    
    return result;
}

const getMealsFromDB = async () => {
    const meals = await prisma.meals.findMany({
        include: {
            category: true,
            provider: true
        }
    });
    return meals;
};

const getMealById = async (id: string) => {
    const meal = await prisma.meals.findUnique({
        where: { id },      
        include: {
            category: true,
            provider: true          

        }
    });
    return meal;
}


export const MealService = {
    createMealInfoDB,
    getMealsFromDB,
    getMealById
};  
