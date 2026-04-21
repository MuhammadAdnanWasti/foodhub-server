import sendResponce from "../../utils/sendResponce";

import { Request, Response } from "express";
import { CategoriesService } from "./categories.service";
import { categoriesValidationSchema } from "./categories.validation";

const createCategory= async (req: Request, res: Response) => {
    try {
        // Validate request
        const validation = categoriesValidationSchema.createCategorySchema.safeParse(req.body);
        if (!validation.success) {
            return sendResponce(res, {
                statusCode: 400,
                success: false,
                message: validation.error.errors[0]?.message || "Validation failed",
                data: {}
            });
        }

        const result=await CategoriesService.createCategoryInfoDB(validation.data, req.user?.id)
       
     
        sendResponce(res,{
            statusCode:201,
            success:true,
            message:"Category created successfully",
            data:result
        })

    } catch (error) {
        sendResponce(res,{
            statusCode:500,
            success:false,     
            message: error instanceof Error ? error.message : "Failed to create category!",
            data:{}
        })
    }
}

const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await CategoriesService.getCategories();
        
        if (categories.length === 0) {
            return sendResponce(res, {
                statusCode: 404,
                success: false,
                message: "No categories found",
                data: []
            });
        }

        sendResponce(res, {
            statusCode: 200,
            success: true,
            message: "Categories retrieved successfully",
            data: categories
        });
    } catch (error) {
        sendResponce(res, {
            statusCode: 500,
            success: false,
            message: error instanceof Error ? error.message : "Failed to retrieve categories",
            data: {}
        });
    }
}

const updateCategory = async (req: Request, res: Response) => {
    try {
        // Validate request
        const validation = categoriesValidationSchema.updateCategorySchema.safeParse(req.body);
        if (!validation.success) {
            return sendResponce(res, {
                statusCode: 400,
                success: false,
                message: validation.error.errors[0]?.message || "Validation failed",
                data: {}
            });
        }

        const result = await CategoriesService.updateCategory(req.params.id, validation.data);

        sendResponce(res, {
            statusCode: 200,
            success: true,
            message: "Category updated successfully",
            data: result
        });
    } catch (error) {
        const statusCode = error instanceof Error && error.message === "Category not found" ? 404 : 500;
        sendResponce(res, {
            statusCode,
            success: false,
            message: error instanceof Error ? error.message : "Failed to update category",
            data: {}
        });
    }
}

const deleteCategory = async (req: Request, res: Response) => {
    try {
        const result = await CategoriesService.deleteCategory(req.params.id);

        sendResponce(res, {
            statusCode: 200,
            success: true,
            message: "Category deleted successfully",
            data: result
        });
    } catch (error) {
        const statusCode = error instanceof Error && error.message === "Category not found" ? 404 : 500;
        sendResponce(res, {
            statusCode,
            success: false,
            message: error instanceof Error ? error.message : "Failed to delete category",
            data: {}
        });
    }
}

export const CategoriesController = {
    // Add controller methods here
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
    };