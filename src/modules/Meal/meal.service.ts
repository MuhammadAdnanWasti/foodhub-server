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

const updateMealById = async (id: string, payLoad: any, userId: string | undefined) => {
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
        throw new Error("Provider profile not found. Only providers can update meals.")
    }
    const meal = await prisma.meals.findUnique({
        where: { id }
    });
    if (!meal) {
        throw new Error("Meal not found")
    }
    if (meal.providerId !== providerProfile.id) {
        throw new Error("You are not authorized to update this meal")
    }

    const data: {
        name?: string
        description?: string
        price?: number
        image?: string
        categoryId?: string
    } = {}

    if (payLoad.name !== undefined && payLoad.name !== null) {
        data.name = String(payLoad.name)
    }
    if (payLoad.description !== undefined && payLoad.description !== null) {
        data.description = String(payLoad.description)
    }
    if (payLoad.price !== undefined && payLoad.price !== null) {
        const p = typeof payLoad.price === "number" ? payLoad.price : parseFloat(String(payLoad.price))
        if (Number.isNaN(p)) {
            throw new Error("Invalid price")
        }
        data.price = p
    }
    if (payLoad.image !== undefined && payLoad.image !== null) {
        data.image = String(payLoad.image)
    }

    if (payLoad.categoryName !== undefined && payLoad.categoryName !== null && String(payLoad.categoryName).trim() !== "") {
        const category = await prisma.categories.findUnique({
            where: { name: String(payLoad.categoryName) }
        })
        if (!category) {
            throw new Error(`Category "${payLoad.categoryName}" not found. Please create the category first.`)
        }
        data.categoryId = category.id
    } else if (payLoad.categoryId !== undefined && payLoad.categoryId !== null && String(payLoad.categoryId).trim() !== "") {
        const category = await prisma.categories.findUnique({
            where: { id: String(payLoad.categoryId) }
        })
        if (!category) {
            throw new Error("Category not found")
        }
        data.categoryId = category.id
    }

    if (Object.keys(data).length === 0) {
        return prisma.meals.findUnique({
            where: { id },
            include: { category: true, provider: true }
        })
    }

    return prisma.meals.update({
        where: { id },
        data,
        include: { category: true, provider: true }
    })
}

const deleteMealById = async (id: string, userId: string | undefined) => {
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
        throw new Error("Provider profile not found. Only providers can delete meals.")
    }
    const meal = await prisma.meals.findUnique({
        where: { id }
    });
    if (!meal) {
        throw new Error("Meal not found")
    }
    if (meal.providerId !== providerProfile.id) {
        throw new Error("You are not authorized to delete this meal")
    }

    return prisma.$transaction(async (tx) => {
        await tx.review.deleteMany({ where: { mealId: id } })
        await tx.orders.deleteMany({ where: { mealId: id } })
        return tx.meals.delete({
            where: { id },
            include: { category: true, provider: true }
        })
    })
}

       
export const MealService = {
    createMealInfoDB,
    getMealsFromDB,
    getMealById,
    updateMealById,
    deleteMealById
};  
