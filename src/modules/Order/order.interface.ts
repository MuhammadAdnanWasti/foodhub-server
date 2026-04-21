export type TOrder = {
    id: string;
    userId: string;
    providerId: string;
    deliveryAddress: string;
    status: string;
    totalPrice: number;
    createdAt?: Date;
    updatedAt?: Date;
    orderItems?: TOrderItem[];
};

export type TOrderItem = {
    id: string;
    orderId: string;
    mealId: string;
    quantity: number;
    unitPrice: number;
    createdAt?: Date;
    updatedAt?: Date;
};

export type TCartItem = {
    mealId: string;
    quantity: number;
};

export type TCheckoutRequest = {
    cartItems: TCartItem[];
    deliveryAddress: string;
    providerId: string;
};