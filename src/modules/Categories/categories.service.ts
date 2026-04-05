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
export const CategoriesService = {
    // Add service methods here
    createCategoryInfoDB
    };