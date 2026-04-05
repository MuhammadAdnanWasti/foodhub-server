import sendResponce from "../../utils/sendResponce";
import { MealService } from "./meal.service";
import { Request, Response } from "express";
const createMeal= async (req: Request, res: Response) => {
    try {
        const result=await MealService.createMealInfoDB(req.body, req.user?.id)
       
     
        sendResponce(res,{
            statusCode:200,
            success:true,
            message:"Meal created successfully",
            data:result
        })

    } catch (error) {
        console.error("Error creating meal:", error);
        sendResponce(res,{
            statusCode:500,
            success:false,     
            message: error instanceof Error ? error.message : "Failed to create meal!",
            data:{}
        })
    }
}
export const MealController = {
    // Add controller methods here
    createMeal
    };