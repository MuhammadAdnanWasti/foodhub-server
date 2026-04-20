import sendResponce from "../../utils/sendResponce";
import { ReviewService } from "./review.service";
import { Request, Response } from "express";

const createReview = async (req: Request, res: Response) => {
    try {
        const result = await ReviewService.createReviewInfoDB(req.body, req.user?.id);
        
        sendResponce(res, {
            statusCode: 200,
            success: true,
            message: "Review created successfully",
            data: result
        });

    } catch (error) {
        console.error("Error creating review:", error);
        sendResponce(res, {
            statusCode: 500,
            success: false,
            message: error instanceof Error ? error.message : "Failed to create review!",
            data: {}
        });
    }
};

const getReviews = async (req: Request, res: Response) => {
    try {
        const request = await ReviewService.getReviewsFromDB();
        if (request.length === 0) {
            return res.status(404).json({ message: "Reviews not found" });
        } else {
            res.status(200).json({
                "success": true,
                "message": "Reviews retrieved successfully",
                "data": request
            });
        }

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error?.message || "Failed to retrieve reviews",
            error: error.message
        });
    }
};

const getReviewById = async (req: Request, res: Response) => {
    try {
        const request = await ReviewService.getReviewById(parseInt(req.params.id));
        if (request === null) {
            return res.status(404).json({ message: "Review not found" });
        } else {
            res.status(200).json({
                "success": true,
                "message": "Review retrieved successfully",
                "data": request
            });
        }

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error?.message || "Failed to retrieve review",
            error: error?.message
        });
    }
};

const getReviewsByMeal = async (req: Request, res: Response) => {
    try {
        const request = await ReviewService.getReviewsByMeal(req.params.mealId);
        if (request.length === 0) {
            return res.status(404).json({ message: "No reviews found for this meal" });
        } else {
            res.status(200).json({
                "success": true,
                "message": "Reviews retrieved successfully",
                "data": request
            });
        }

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error?.message || "Failed to retrieve reviews",
            error: error?.message
        });
    }
};

const getReviewsByUser = async (req: Request, res: Response) => {
    try {
        const request = await ReviewService.getReviewsByUser(req.params.userId);
        if (request.length === 0) {
            return res.status(404).json({ message: "No reviews found for this user" });
        } else {
            res.status(200).json({
                "success": true,
                "message": "Reviews retrieved successfully",
                "data": request
            });
        }

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error?.message || "Failed to retrieve reviews",
            error: error?.message
        });
    }
};

const updateReviewById = async (req: Request, res: Response) => {
    try {
        const request = await ReviewService.updateReviewById(parseInt(req.params.id), req.body, req.user?.id);
        sendResponce(res, {
            statusCode: 200,
            success: true,
            message: "Review updated successfully",
            data: request
        });
    } catch (error: any) {
        sendResponce(res, {
            statusCode: 500,
            success: false,
            message: error?.message || "Failed to update review"
        });
    }
};

const deleteReviewById = async (req: Request, res: Response) => {
    try {
        const request = await ReviewService.deleteReviewById(parseInt(req.params.id), req.user?.id);
        sendResponce(res, {
            statusCode: 200,
            success: true,
            message: "Review deleted successfully",
            data: request
        });
    } catch (error: any) {
        sendResponce(res, {
            statusCode: 500,
            success: false,
            message: error?.message || "Failed to delete review"
        });
    }
};

export const ReviewController = {
    createReview,
    getReviews,
    getReviewById,
    getReviewsByMeal,
    getReviewsByUser,
    updateReviewById,
    deleteReviewById
};