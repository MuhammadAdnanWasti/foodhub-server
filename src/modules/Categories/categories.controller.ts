import sendResponce from "../../utils/sendResponce";

import { Request, Response } from "express";
import { CategoriesService } from "./categories.service";
const createCategory= async (req: Request, res: Response) => {
    try {
        const result=await CategoriesService.createCategoryInfoDB(req.body, req.user?.id)
       
     
        sendResponce(res,{
            statusCode:200,
            success:true,
            message:"Category created successfully",
            data:result
        })

    } catch (error) {
        sendResponce(res,{
            statusCode:500,
            success:false,     
            message:"Failed to create category!",
            data:error
        })
    }
}
export const CategoriesController = {
    // Add controller methods here
    createCategory
    };