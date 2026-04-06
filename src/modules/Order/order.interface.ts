export type TOrder = {
    id: string;
    quantity: number;
    status: string;
    totalPrice: number;
    userId: string;
    mealId: string;
    createdAt?: Date;
    updatedAt?: Date;
};