import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { createTenant, getTenantById, getTenantProperty, updateTenant, addFavoriteProperty, removeFavoriteProperty } from "../controllers/tenantController";

const router = express.Router();

// POST is open — registration must work before the user has a role in JWT
router.post("/", createTenant);
// These routes require an authenticated tenant
router.get("/:clerkId", authMiddleware(["tenant"]), getTenantById);
router.put("/:clerkId", authMiddleware(["tenant"]), updateTenant);
router.get("/:clerkId/current-residences", authMiddleware(["tenant"]), getTenantProperty);
router.post("/:clerkId/favorites/:propertyId", authMiddleware(["tenant"]), addFavoriteProperty);
router.delete("/:clerkId/favorites/:propertyId", authMiddleware(["tenant"]), removeFavoriteProperty);

export default router;