import { Request, Response } from "express";
import { CartService } from "./cart.service";
import { cartValidationSchema } from "./cart.validation";
import sendResponce from "../../utils/sendResponce";

const getMyCart = async (req: Request, res: Response) => {
    try {
        const cart = await CartService.getMyCart(req.user?.id as string);
        sendResponce(res, {
            statusCode: 200,
            success: true,
            message: "Cart retrieved successfully",
            data: cart,
        });
    } catch (error: any) {
        sendResponce(res, {
            statusCode: 500,
            success: false,
            message: error?.message || "Failed to retrieve cart",
        });
    }
};

const addItem = async (req: Request, res: Response) => {
    try {
        const parsed = cartValidationSchema.addItemSchema.safeParse(req.body);
        if (!parsed.success) {
            return sendResponce(res, {
                statusCode: 400,
                success: false,
                message: parsed.error.issues[0]?.message ?? "Invalid input",
            });
        }

        const cart = await CartService.addItem(req.user?.id as string, parsed.data.mealId);
        sendResponce(res, {
            statusCode: 200,
            success: true,
            message: "Item added to cart",
            data: cart,
        });
    } catch (error: any) {
        const statusCode = error?.message?.includes("different restaurant") ? 409 : 500;
        sendResponce(res, {
            statusCode,
            success: false,
            message: error?.message || "Failed to add item to cart",
        });
    }
};

const updateQuantity = async (req: Request, res: Response) => {
    try {
        const parsed = cartValidationSchema.updateQuantitySchema.safeParse(req.body);
        if (!parsed.success) {
            return sendResponce(res, {
                statusCode: 400,
                success: false,
                message: parsed.error.issues[0]?.message ?? "Invalid input",
            });
        }

        const cart = await CartService.updateQuantity(
            req.user?.id as string,
            req.params.mealId as string,
            parsed.data.quantity
        );
        sendResponce(res, {
            statusCode: 200,
            success: true,
            message: "Cart updated",
            data: cart,
        });
    } catch (error: any) {
        sendResponce(res, {
            statusCode: 500,
            success: false,
            message: error?.message || "Failed to update cart",
        });
    }
};

const removeItem = async (req: Request, res: Response) => {
    try {
        const cart = await CartService.removeItem(req.user?.id as string, req.params.mealId as string);
        sendResponce(res, {
            statusCode: 200,
            success: true,
            message: "Item removed from cart",
            data: cart,
        });
    } catch (error: any) {
        sendResponce(res, {
            statusCode: 500,
            success: false,
            message: error?.message || "Failed to remove item from cart",
        });
    }
};

const clearCart = async (req: Request, res: Response) => {
    try {
        const cart = await CartService.clearCart(req.user?.id as string);
        sendResponce(res, {
            statusCode: 200,
            success: true,
            message: "Cart cleared",
            data: cart,
        });
    } catch (error: any) {
        sendResponce(res, {
            statusCode: 500,
            success: false,
            message: error?.message || "Failed to clear cart",
        });
    }
};

export const CartController = {
    getMyCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
};
