export type TReview = {
    id: number;
    rating: number;
    comment?: string | null;
    createdAt: Date;
    userId: string;
    mealId: string;
};