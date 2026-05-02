import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { paymentId } = req.body;

        // Derive client URL: prefer env var, fall back to request Origin/Referer
        const clientUrl =
            process.env.CLIENT_URL?.replace(/^["']|["']$/g, "").replace(/\/+$/, "") ||
            req.headers.origin ||
            (req.headers.referer ? new URL(req.headers.referer).origin : null);

        if (!clientUrl) {
            res.status(500).json({ message: "CLIENT_URL is not configured on the server." });
            return;
        }

        const payment = await prisma.payment.findUnique({
            where: { id: Number(paymentId) },
            include: {
                lease: {
                    include: {
                        property: true,
                        tenant: true,
                    },
                },
            },
        });

        if (!payment) {
            res.status(404).json({ message: "Payment not found" });
            return;
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: `Rent for ${payment.lease.property.name}`,
                            description: `Lease period: ${new Date(payment.lease.startDate).toLocaleDateString()} - ${new Date(payment.lease.endDate).toLocaleDateString()}`,
                        },
                        unit_amount: Math.round(payment.amountDue * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${clientUrl}/payment-cancel`,
            client_reference_id: paymentId.toString(),
            metadata: {
                paymentId: paymentId.toString(),
            },
        });

        res.json({ url: session.url });
    } catch (error: any) {
        console.error("[Checkout] Error creating checkout session:", error);
        res.status(500).json({ message: error.message || "Failed to create checkout session" });
    }
};

export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig!,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const paymentId = session.metadata?.paymentId;

        if (paymentId) {
            await prisma.payment.update({
                where: { id: Number(paymentId) },
                data: {
                    paymentStatus: "Paid",
                    paymentDate: new Date(),
                    amountPaid: session.amount_total ? session.amount_total / 100 : 0,
                },
            });
        }
    }

    res.json({ received: true });
};
