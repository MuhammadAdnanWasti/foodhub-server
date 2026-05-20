export type TCartItem = {
    id: string;
    cartId: string;
    mealId: string;
    quantity: number;
    createdAt?: Date;
    updatedAt?: Date;
};

export type TCart = {
    id: string;
    userId: string;
    items: TCartItem[];
    createdAt?: Date;
    updatedAt?: Date;
};
