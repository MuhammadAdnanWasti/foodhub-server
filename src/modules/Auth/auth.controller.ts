import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { authValidationSchema } from "./auth.validation";
import sendResponce from "../../utils/sendResponce";

const createUser = async (req: Request, res: Response) => {
    try {
        // Validate request body
        const validatedData = authValidationSchema.registerValidationSchema.parse(req.body);
        
        const result = await AuthService.createUserInfoDB(validatedData);
       
        sendResponce(res, {
            statusCode: 200,
            success: true,
            message: validatedData.isProvider 
                ? "Provider registered successfully" 
                : "User registered successfully",
            data: result
        });

    } catch (error: any) {
        sendResponce(res, {
            statusCode: 400,
            success: false,     
            message: error.message || "Failed to create user",
            data: null
        });
    }
};

const loginUser = async (req: Request, res: Response) => {
    try {
        // Validate request body
        const validatedData = authValidationSchema.loginValidationSchema.parse(req.body);
        
        const result = await AuthService.loginUserDB(validatedData);
      
        res.cookie("token", result.token, {
            secure: false,
            httpOnly: true,
            sameSite: "strict",
        });
        sendResponce(res, {
            statusCode: 200,
            success: true,
            message: "User logged in successfully",
            data: result
        });

    } catch (error: any) {
        sendResponce(res, {
            statusCode: 400,
            success: false,     
            message: error.message || "Failed to login user",
            data: null
        });
    }
};

export const AuthController = {
    createUser,
    loginUser
};