/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from "crypto";
import Stripe from "stripe";

import { envVars } from "../../config/env";
import { stripe } from "../../config/stripe.config";
import { OrderStatus, PaymentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { DELIVERY_FEE } from "./order.constant";

const createOrder = async (payLoad: any, userId: string, mealId: string) => {
    if (!mealId) {
        throw new Error("Meal ID is required to create an order")
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    })
    if (!user) {
        throw new Error("User not found")
    }
    const meal = await prisma.meals.findUnique({
        where: { id: mealId }
    })
    if (!meal) {
        throw new Error("Meal not found")
    }

    const result = await prisma.orders.create({
        data: {
            userId: user.id,
            providerId: meal.providerId,
            deliveryAddress: payLoad.deliveryAddress || "Not specified",
            status: payLoad.status,
            totalPrice: parseFloat(payLoad.totalPrice),
            orderItems: {
                create: {
                    mealId: payLoad.mealId,
                    quantity: payLoad.quantity,
                    unitPrice: meal.price
                }
            }
        },
        include: {
            orderItems: {
                include: {
                    meal: true
                }
            }
        }
    })

    return result;
}

interface CartItem {
    mealId: string;
    quantity: number;
}

interface CheckoutPayload {
    cartItems: CartItem[];
    deliveryAddress: string;
    providerId: string;
}

const checkoutCart = async (payload: CheckoutPayload, userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    })
    if (!user) {
        throw new Error("User not found")
    }

    const provider = await prisma.providerProfiles.findUnique({
        where: { id: payload.providerId }
    })
    if (!provider) {
        throw new Error("Provider not found")
    }

    const mealIds = payload.cartItems.map(item => item.mealId)
    const meals = await prisma.meals.findMany({
        where: {
            id: { in: mealIds }
        }
    })

    if (meals.length !== mealIds.length) {
        throw new Error("One or more meals not found")
    }

    const allBelongToProvider = meals.every(meal => meal.providerId === payload.providerId)
    if (!allBelongToProvider) {
        throw new Error("All meals must belong to the same provider")
    }

    let totalPrice = 0
    const orderItemsData: any[] = []

    payload.cartItems.forEach(item => {
        const meal = meals.find(m => m.id === item.mealId)
        if (meal) {
            totalPrice += meal.price * item.quantity
            orderItemsData.push({
                mealId: item.mealId,
                quantity: item.quantity,
                unitPrice: meal.price
            })
        }
    })

    const order = await prisma.orders.create({
        data: {
            userId,
            providerId: payload.providerId,
            deliveryAddress: payload.deliveryAddress,
            status: "PLACED",
            totalPrice,
            orderItems: {
                create: orderItemsData
            }
        },
        include: {
            orderItems: {
                include: {
                    meal: true
                }
            },
            user: true,
            provider: true
        }
    })

    return order
}

const getOrders = async (userId: string) => {
    const orders = await prisma.orders.findMany({
        where: {
            userId: userId
        },
        include: {
            user: true,
            provider: true,
            orderItems: {
                include: {
                    meal: true
                }
            }
        }
    });
    return orders;
};

const getOrderById = async (id: string, userId: string) => {
    const order = await prisma.orders.findUnique({
        where: { id },
        include: {
            user: true,
            provider: true,
            orderItems: {
                include: {
                    meal: true
                }
            }
        }
    });

    if (order && order.userId !== userId) {
        throw new Error("You don't have permission to view this order")
    }

    return order;
}

const cancelOrder = async (orderId: string, userId: string) => {
    const order = await prisma.orders.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");
    if (order.userId !== userId) throw new Error("You are not authorized to cancel this order");
    if (order.status !== OrderStatus.PLACED && order.status !== OrderStatus.PENDING_PAYMENT) {
        throw new Error("Only orders with status PLACED or PENDING_PAYMENT can be cancelled");
    }

    return prisma.orders.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
        include: {
            orderItems: { include: { meal: true } },
            user: true,
            provider: true,
        },
    });
};

const initiateStripeCheckout = async (userId: string, deliveryAddress: string) => {
    if (!deliveryAddress || deliveryAddress.trim().length < 5) {
        throw new Error("Delivery address must be at least 5 characters");
    }

    const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: { meal: true },
            },
        },
    });

    if (!cart || cart.items.length === 0) {
        throw new Error("Your cart is empty");
    }

    const mealIds = cart.items.map((item) => item.mealId);
    const meals = await prisma.meals.findMany({ where: { id: { in: mealIds } } });

    const providerIds = [...new Set(meals.map((meal) => meal.providerId))];
    if (providerIds.length !== 1) {
        throw new Error("All cart items must belong to the same restaurant");
    }
    const providerId = providerIds[0];

    let subtotal = 0;
    const orderItemsData: { mealId: string; quantity: number; unitPrice: number }[] = [];

    cart.items.forEach((item) => {
        const meal = meals.find((m) => m.id === item.mealId);
        if (meal) {
            subtotal += meal.price * item.quantity;
            orderItemsData.push({
                mealId: item.mealId,
                quantity: item.quantity,
                unitPrice: meal.price,
            });
        }
    });

    const totalPrice = parseFloat((subtotal + DELIVERY_FEE).toFixed(2));
    const placeholderSessionId = `pending_${randomUUID()}`;

    const { order, payment } = await prisma.$transaction(async (tx) => {
        const createdOrder = await tx.orders.create({
            data: {
                userId,
                providerId,
                deliveryAddress: deliveryAddress.trim(),
                status: OrderStatus.PENDING_PAYMENT,
                totalPrice,
                orderItems: { create: orderItemsData },
            },
            include: {
                orderItems: { include: { meal: true } },
            },
        });

        const createdPayment = await tx.payment.create({
            data: {
                amount: totalPrice,
                orderId: createdOrder.id,
                stripeSessionId: placeholderSessionId,
                status: PaymentStatus.UNPAID,
            },
        });

        return { order: createdOrder, payment: createdPayment };
    });

    const lineItems = [
        ...order.orderItems.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.meal.name,
                },
                unit_amount: Math.round(item.unitPrice * 100),
            },
            quantity: item.quantity,
        })),
        {
            price_data: {
                currency: "usd",
                product_data: {
                    name: "Delivery Fee",
                },
                unit_amount: Math.round(DELIVERY_FEE * 100),
            },
            quantity: 1,
        },
    ];

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: lineItems,
        metadata: {
            orderId: order.id,
            paymentId: payment.id,
        },
        payment_intent_data: {
            metadata: {
                orderId: order.id,
                paymentId: payment.id,
            },
        },
        success_url: `${envVars.STRIPE.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: envVars.STRIPE.CANCEL_URL,
    });

    if (!session.url) {
        throw new Error("Failed to create Stripe checkout session");
    }

    await prisma.payment.update({
        where: { id: payment.id },
        data: { stripeSessionId: session.id },
    });

    return {
        checkoutUrl: session.url,
        orderId: order.id,
        paymentId: payment.id,
    };
};

export const OrderService = {
    createOrder,
    checkoutCart,
    getOrders,
    getOrderById,
    cancelOrder,
    initiateStripeCheckout,
};
