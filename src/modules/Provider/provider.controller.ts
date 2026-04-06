import { Request, Response } from "express";
import { ProviderService } from "./provider.service";

const getAllProviders= async (req: Request, res: Response) => {
  
  try {
    const request = await ProviderService.getAllProviders();
    if(request.length===0){
        return res.status(404).json({ message: "Providers not found"})
    }else{
        res.status(201).json({
  "success": true,
  "message": "Providers retrieved successfully",
  "data":request
})  
        
    }

  
  } catch (error: any) {
     res.status(500).json({
      success: false,
      message: error?.message || "Failed to retrieve providers",
      error: error.message
    });
  }
}

const getProviderById=async (req:Request, res:Response) => {
  

  try {
    const request = await ProviderService.getProviderById(req.params.id as string) 
    if(request === null){
        return res.status(404).json({ message: "Provider not found"})
    }else{
        res.status(201).json({
  "success": true,
  "message": "Provider retrieved successfully",
  "data":request
})  
        
    }

  
  } catch (error: any) {
     res.status(500).json({
      success: false,
      message: error?.message || "Failed to retrieve provider",
      error: error.message
    });
  }
 
}
export const ProviderController = {
    // Add controller methods here
    getProviderById,
    getAllProviders
    };