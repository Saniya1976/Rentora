import express from "express";
import { createTenant, getTenantById, getTenantProperty, updateTenant } from "../controllers/tenantController";

const router = express.Router();

router.get("/:clerkId", getTenantById);
router.post("/", createTenant);
router.put("/:clerkId", updateTenant);
router.get("/:clerkId/properties", getTenantProperty);

export default router;