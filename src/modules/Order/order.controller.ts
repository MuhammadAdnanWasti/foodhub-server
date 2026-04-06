import { Request, Response } from "express";
import { OrderService } from "./order.service";
import sendResponce from "../../utils/sendResponce";

const createOrder= async (req: Request, res: Response) => {
    try {
        const result=await OrderService.createOrder(req.body, req.user?.id, req.body.mealId)
       
     
        sendResponce(res,{
            statusCode:200,
            success:true,
            message:"Order created successfully",
            data:result
        })

    } catch (error) {
        console.error("Error creating order:", error);
        sendResponce(res,{
            statusCode:500,
            success:false,     
            message: error instanceof Error ? error.message : "Failed to create order!",
            data:{}
        })
    }
}

const getOrders= async (req: Request, res: Response) => {
  
  try {
    const request = await OrderService.getOrders(req.user?.id as string);
    if(request.length===0){
        return res.status(404).json({ message: "Orders not found"})
    }else{
        res.status(201).json({
  "success": true,
  "message": "Orders retrieved successfully",
  "data":request
})  
        
    }

  
  } catch (error: any) {
     res.status(500).json({
      success: false,
      message: error?.message || "Failed to retrieve orders",
      error: error.message
    });
  }
}

const getOrderById=async (req:Request, res:Response) => {
  

  try {
    const request = await OrderService.getOrderById(req.params.id as string, req.user?.id as string) 
    if(request === null){
        return res.status(404).json({ message: "Order not found"})
    }else{
        res.status(201).json({
  "success": true,
  "message": "Order retrieved successfully",
  "data":request
})  
        
    }

  
  } catch (error: any) {
     res.status(500).json({
      success: false,
      message: error?.message || "Failed to retrieve order",
      error: error.message
    });
  }
 
}
export const OrderController = {
    // Add controller methods here
    createOrder,
    getOrders,
    getOrderById
    };