import { prisma } from "../../lib/prisma"

const createCategoryInfoDB =async (payLoad:any, userId:string ) => {
     

    const user= await prisma.user.findUnique({
        where:{id:userId}
    })  
    if(!user){
        throw new Error("User not found")
    }

   

      
    
    const result=await prisma.categories.create({
        data:payLoad
    })
    
    return result;
}

const getCategories = async () => {
    const categories = await prisma.categories.findMany({
        include: {
            meals: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return categories
}

const updateCategory = async (categoryId: string, payload: any) => {
    // Check if category exists
    const existing = await prisma.categories.findUnique({
        where: { id: categoryId }
    })
    
    if (!existing) {
        throw new Error("Category not found")
    }

    // Check if name is being updated and if it's unique
    if (payload.name && payload.name !== existing.name) {
        const duplicate = await prisma.categories.findUnique({
            where: { name: payload.name }
        })
        if (duplicate) {
            throw new Error("Category name already exists")
        }
    }

    const result = await prisma.categories.update({
        where: { id: categoryId },
        data: payload,
        include: {
            meals: true
        }
    })
    
    return result
}

const deleteCategory = async (categoryId: string) => {
    // Check if category exists
    const existing = await prisma.categories.findUnique({
        where: { id: categoryId }
    })
    
    if (!existing) {
        throw new Error("Category not found")
    }

    // Check if category has meals
    const mealsCount = await prisma.meals.count({
        where: { categoryId }
    })

    if (mealsCount > 0) {
        throw new Error(`Cannot delete category. It has ${mealsCount} meal(s) associated with it`)
    }

    const result = await prisma.categories.delete({
        where: { id: categoryId }
    })
    
    return result
}

export const CategoriesService = {
    // Add service methods here
    createCategoryInfoDB,
    getCategories,
    updateCategory,
    deleteCategory
    };