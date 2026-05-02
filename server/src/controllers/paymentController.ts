import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/** Returns true only if the string is a valid http/https URL */
function isValidHttpUrl(value: unknown): value is string {
    if (typeof value !== "string" || !value) return false;
    try {
        const { protocol } = new URL(value);
        return protocol === "http:" || protocol === "https:";
    } catch {
        return false;
    }
}

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { paymentId } = req.body;

        // Build candidate list in priority order and pick the first valid one
        const envUrl = process.env.CLIENT_URL?.replace(/^["']|["']$/g, "").replace(/\/+$/, "");
        const originHeader = req.headers.origin;
        const refererOrigin = req.headers.referer
            ? (() => { try { return new URL(req.headers.referer as string).origin; } catch { return undefined; } })()
            : undefined;

        console.log("[Checkout] CLIENT_URL env:", envUrl);
        console.log("[Checkout] Origin header:", originHeader);
        console.log("[Checkout] Referer origin:", refererOrigin);

        const clientUrl =
            isValidHttpUrl(envUrl) ? envUrl :
                isValidHttpUrl(originHeader) ? originHeader :
                    isValidHttpUrl(refererOrigin) ? refererOrigin : null;

        console.log("[Checkout] Resolved clientUrl:", clientUrl);

        if (!clientUrl) {
            console.error("[Checkout] Could not derive a valid CLIENT_URL. Set the CLIENT_URL environment variable on the server.");
            res.status(500).json({ message: "CLIENT_URL is not configured on the server. Please contact support." });
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
