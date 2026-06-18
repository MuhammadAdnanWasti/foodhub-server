/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";

import { OrderStatus, PaymentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const handlerStripeWebhookEvent = async (event: any) => {
    const existingPayment = await prisma.payment.findFirst({
        where: {
            stripeEventId: event.id,
        },
    });

    if (existingPayment) {
        console.log(`Event ${event.id} already processed. Skipping`);
        return { message: `Event ${event.id} already processed. Skipping` };
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as any;
            const orderId = session.metadata?.orderId;
            const paymentId = session.metadata?.paymentId;

            if (!orderId || !paymentId) {
                console.error("Missing orderId or paymentId in session metadata");
                return { message: "Missing orderId or paymentId in metadata" };
            }

            if (session.payment_status !== "paid") {
                console.log(`Session ${session.id} not paid yet (status: ${session.payment_status})`);
                return { message: "Payment not completed" };
            }

            const paymentIntentId =
                typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : session.payment_intent?.id ?? null;

            const updatedPayment = await prisma.$transaction(async (tx) => {
                const payment = await tx.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: PaymentStatus.PAID,
                        stripePaymentIntentId: paymentIntentId,
                        stripeEventId: event.id,
                        paymentGatewayData: session as object,
                    },
                });

                await tx.orders.update({
                    where: { id: orderId },
                    data: { status: OrderStatus.PLACED },
                });

                const order = await tx.orders.findUnique({
                    where: { id: orderId },
                    select: { userId: true },
                });

                if (order) {
                    const cart = await tx.cart.findUnique({
                        where: { userId: order.userId },
                    });

                    if (cart) {
                        await tx.cartItem.deleteMany({
                            where: { cartId: cart.id },
                        });
                    }
                }

                return payment;
            });

            console.log(`Payment PAID for order ${orderId}`);
            return { updatedPayment };
        }

        case "checkout.session.expired": {
            const session = event.data.object as any;
            const orderId = session.metadata?.orderId;
            const paymentId = session.metadata?.paymentId;

            const payment = paymentId
                ? await prisma.payment.findUnique({ where: { id: paymentId } })
                : await prisma.payment.findUnique({ where: { stripeSessionId: session.id } });

            if (!payment) {
                console.error(`Payment not found for expired session ${session.id}`);
                return { message: "Payment not found" };
            }

            if (payment.status === PaymentStatus.PAID) {
                console.log(`Payment ${payment.id} already paid. Skipping expired event.`);
                return { message: "Payment already completed" };
            }

            const resolvedOrderId = orderId ?? payment.orderId;

            const updatedPayment = await prisma.$transaction(async (tx) => {
                const updated = await tx.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: PaymentStatus.FAILED,
                        stripeEventId: event.id,
                        paymentGatewayData: session as object,
                    },
                });

                await tx.orders.update({
                    where: { id: resolvedOrderId },
                    data: { status: OrderStatus.CANCELLED },
                });

                return updated;
            });

            console.log(`Checkout session ${session.id} expired. Order ${resolvedOrderId} cancelled.`);
            return { updatedPayment };
        }

        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object as any;
            const orderId = paymentIntent.metadata?.orderId;
            const paymentId = paymentIntent.metadata?.paymentId;

            const payment = paymentId
                ? await prisma.payment.findUnique({ where: { id: paymentId } })
                : await prisma.payment.findFirst({
                      where: { stripePaymentIntentId: paymentIntent.id },
                  });

            if (!payment) {
                console.error(`Payment not found for failed payment intent ${paymentIntent.id}`);
                return { message: "Payment not found" };
            }

            if (payment.status === PaymentStatus.PAID) {
                console.log(`Payment ${payment.id} already paid. Skipping failed event.`);
                return { message: "Payment already completed" };
            }

            const resolvedOrderId = orderId ?? payment.orderId;

            const updatedPayment = await prisma.$transaction(async (tx) => {
                const updated = await tx.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: PaymentStatus.FAILED,
                        stripePaymentIntentId: paymentIntent.id,
                        stripeEventId: event.id,
                        paymentGatewayData: paymentIntent as object,
                    },
                });

                await tx.orders.update({
                    where: { id: resolvedOrderId },
                    data: { status: OrderStatus.CANCELLED },
                });

                return updated;
            });

            console.log(`Payment intent ${paymentIntent.id} failed. Order ${resolvedOrderId} cancelled.`);
            return { updatedPayment };
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return { message: `Webhook Event ${event.id} processed successfully` };
};

export const PaymentService = {
    handlerStripeWebhookEvent,
};
