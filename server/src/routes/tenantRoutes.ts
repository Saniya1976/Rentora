import express from "express";
import { createTenant, getTenantById } from "../controllers/tenantController.js";

const router = express.Router();

router.get("/:clerkId", getTenantById);
router.post("/", createTenant);

export default router;