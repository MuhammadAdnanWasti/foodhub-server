import { Request, Response } from "express";
import { OrderService } from "./order.service";
import { orderValidationSchema } from "./order.validation";
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

const checkoutCart = async (req: Request, res: Response) => {
    try {
        // Validate request body
        const validationResult = orderValidationSchema.checkoutRequestSchema.safeParse(req.body);
        
        if (!validationResult.success) {
            return sendResponce(res, {
                statusCode: 400,
                success: false,
                message: "Validation failed",
                data: validationResult.error.issues
            });
        }

        const result = await OrderService.checkoutCart(validationResult.data, req.user?.id as string);

        sendResponce(res, {
            statusCode: 201,
            success: true,
            message: "Order placed successfully",
            data: result
        });
    } catch (error) {
        console.error("Error during checkout:", error);
        sendResponce(res, {
            statusCode: 500,
            success: false,
            message: error instanceof Error ? error.message : "Failed to place order",
            data: {}
        });
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
const cancelOrder = async (req: Request, res: Response) => {
    try {
        const result = await OrderService.cancelOrder(req.params.id as string, req.user?.id as string);
        sendResponce(res, {
            statusCode: 200,
            success: true,
            message: "Order cancelled successfully",
            data: result,
        });
    } catch (error: any) {
        sendResponce(res, {
            statusCode: error?.message?.includes("not authorized") ? 403 : 400,
            success: false,
            message: error?.message || "Failed to cancel order",
        });
    }
};

const checkoutCartFromDb = async (req: Request, res: Response) => {
    try {
        const { deliveryAddress } = req.body;
        if (!deliveryAddress) {
            return sendResponce(res, {
                statusCode: 400,
                success: false,
                message: "Delivery address is required",
            });
        }
        const result = await OrderService.initiateStripeCheckout(req.user?.id as string, deliveryAddress);
        sendResponce(res, {
            statusCode: 201,
            success: true,
            message: "Checkout session created successfully",
            data: result,
        });
    } catch (error: any) {
        sendResponce(res, {
            statusCode: 400,
            success: false,
            message: error?.message || "Failed to place order",
        });
    }
};

export const OrderController = {
    createOrder,
    checkoutCart,
    getOrders,
    getOrderById,
    cancelOrder,
    checkoutCartFromDb,
};