import { prisma } from "../../lib/prisma";

const createReviewInfoDB = async (payLoad: any, userId: string) => {
    // Validate user exists
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    
    if (!user) {
        throw new Error("User not found");
    }

    // Validate meal exists
    const meal = await prisma.meals.findUnique({
        where: { id: payLoad.mealId }
    });
    
    if (!meal) {
        throw new Error("Meal not found");
    }

    // Validate rating is between 1 and 5
    if (payLoad.rating < 1 || payLoad.rating > 5) {
        throw new Error("Rating must be between 1 and 5");
    }

    // Create review
    const result = await prisma.review.create({
        data: {
            rating: payLoad.rating,
            comment: payLoad.comment || null,
            userId: userId,
            mealId: payLoad.mealId
        },
        include: {
            user: true,
            meal: true
        }
    });
    
    return result;
};

const getReviewsFromDB = async () => {
    const reviews = await prisma.review.findMany({
        include: {
            user: true,
            meal: true
        }
    });
    return reviews;
};

const getReviewById = async (id: number) => {
    const review = await prisma.review.findUnique({
        where: { id },
        include: {
            user: true,
            meal: true
        }
    });
    return review;
};

const getReviewsByMeal = async (mealId: string) => {
    const reviews = await prisma.review.findMany({
        where: { mealId },
        include: {
            user: true,
            meal: true
        }
    });
    return reviews;
};

const getReviewsByUser = async (userId: string) => {
    const reviews = await prisma.review.findMany({
        where: { userId },
        include: {
            user: true,
            meal: true
        }
    });
    return reviews;
};

const updateReviewById = async (id: number, payLoad: any, userId: string | undefined) => {
    if (!userId) {
        throw new Error("Authentication required");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    
    if (!user) {
        throw new Error("User not found");
    }

    const review = await prisma.review.findUnique({
        where: { id }
    });
    
    if (!review) {
        throw new Error("Review not found");
    }

    // Check if user owns the review
    if (review.userId !== userId) {
        throw new Error("You can only update your own reviews");
    }

    // Validate rating if provided
    if (payLoad.rating && (payLoad.rating < 1 || payLoad.rating > 5)) {
        throw new Error("Rating must be between 1 and 5");
    }

    const result = await prisma.review.update({
        where: { id },
        data: {
            rating: payLoad.rating || review.rating,
            comment: payLoad.comment !== undefined ? payLoad.comment : review.comment
        },
        include: {
            user: true,
            meal: true
        }
    });
    
    return result;
};

const deleteReviewById = async (id: number, userId: string | undefined) => {
    if (!userId) {
        throw new Error("Authentication required");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    
    if (!user) {
        throw new Error("User not found");
    }

    const review = await prisma.review.findUnique({
        where: { id }
    });
    
    if (!review) {
        throw new Error("Review not found");
    }

    // Check if user owns the review
    if (review.userId !== userId) {
        throw new Error("You can only delete your own reviews");
    }

    const result = await prisma.review.delete({
        where: { id }
    });
    
    return result;
};

export const ReviewService = {
    createReviewInfoDB,
    getReviewsFromDB,
    getReviewById,
    getReviewsByMeal,
    getReviewsByUser,
    updateReviewById,
    deleteReviewById
};