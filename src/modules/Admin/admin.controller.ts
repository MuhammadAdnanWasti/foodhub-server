import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import { adminValidationSchema } from "./admin.validation";
import sendResponce from "../../utils/sendResponce";

const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await AdminService.getUsersFromDB();
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: users,
        });
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Failed to retrieve users";
        res.status(500).json({
            success: false,
            message,
            error: message,
        });
    }
};

const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await AdminService.getAllOrders();
        
        if (orders.length === 0) {
            return sendResponce(res, {
                statusCode: 404,
                success: false,
                message: "No orders found",
                data: []
            });
        }

        sendResponce(res, {
            statusCode: 200,
            success: true,
            message: "All orders retrieved successfully",
            data: orders
        });
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Failed to retrieve orders";
        sendResponce(res, {
            statusCode: 500,
            success: false,
            message,
            data: null
        });
    }
};

const updateUserById = async (req: Request, res: Response) => {
    try {
        const parsed = adminValidationSchema.adminUpdateUserSchema.safeParse(
            req.body
        );
        if (!parsed.success) {
            const first = parsed.error.issues[0]?.message ?? "Invalid input";
            return sendResponce(res, {
                statusCode: 400,
                success: false,
                message: first,
                data: null,
            });
        }

        const adminId = req.user?.id as string | undefined;
        if (!adminId) {
            return sendResponce(res, {
                statusCode: 401,
                success: false,
                message: "Unauthorized",
                data: null,
            });
        }

        const userId = String(req.params.id);

        const result = await AdminService.updateUserRoleStatusInDB(
            userId,
            parsed.data,
            adminId
        );

        sendResponce(res, {
            statusCode: 200,
            success: true,
            message: "User updated successfully",
            data: result,
        });
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Failed to update user";
        const statusCode =
            message === "User not found"
                ? 404
                : message.startsWith("You cannot")
                  ? 400
                  : 500;
        sendResponce(res, {
            statusCode,
            success: false,
            message,
            data: null,
        });
    }
};

export const AdminController = {
    getUsers,
    getAllOrders,
    updateUserById,
};
