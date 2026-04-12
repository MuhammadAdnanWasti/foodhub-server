import { get } from "node:http";
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

const getMeals= async (req: Request, res: Response) => {
  
  try {
    const request = await MealService.getMealsFromDB();
    if(request.length===0){
        return res.status(404).json({ message: "Meals not found"})
    }else{
        res.status(201).json({
  "success": true,
  "message": "Meals retrieved successfully",
  "data":request
})  
        
    }

  
  } catch (error: any) {
     res.status(500).json({
      success: false,
      message: error?.message || "Failed to retrieve meals",
      error: error.message
    });
  }
}

const getMealById=async (req:Request, res:Response) => {
  

  try {
    const request = await MealService.getMealById(req.params.id as string) 
    if(request === null){
        return res.status(404).json({ message: "Meal not found"})
    }else{
        res.status(201).json({
  "success": true,
  "message": "Meal retrieved successfully",
  "data":request
})  
        
    }

  
  } catch (error: any) {
     res.status(500).json({
      success: false,
      message: error?.message || "Failed to retrieve meal",
      error: error?.message
    });
  }
 
}

const updateMealById=async (req:Request, res:Response) => {
  
  try {
    const request = await MealService.updateMealById(req.params.id as string, req.body,req.user?.id)
    sendResponce(res,{
      statusCode:200,
      success:true,
      message:"Meal updated successfully",
      data:request
  })
  } catch (error: any) {
    sendResponce(res,{
      statusCode:500,
      success:false,
      message: error?.message || "Failed to update meal",
    
    })
  }
}
const deleteMealById=async (req:Request, res:Response) => {
  
  try {
    const request = await MealService.deleteMealById(req.params.id as string, req.user?.id)
    sendResponce(res,{
      statusCode:200,
      success:true,
      message:"Meal deleted successfully",
      data:request
  })
  } catch (error: any) {
    sendResponce(res,{
      statusCode:500,
      success:false,
      message: error?.message || "Failed to delete meal",
    
    })
  }
}

export const MealController = {
    createMeal,
    getMeals,
    getMealById,
    updateMealById,
    deleteMealById
    };