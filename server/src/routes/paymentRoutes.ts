import express from "express";
import { createCheckoutSession, stripeWebhook } from "../controllers/paymentController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/create-checkout-session", authMiddleware(["tenant"]), createCheckoutSession);
router.post("/webhook", stripeWebhook);

export default router;
