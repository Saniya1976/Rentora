import express from "express";
import { createTenant, getTenantById, getTenantProperty, updateTenant ,addFavoriteProperty,removeFavoriteProperty} from "../controllers/tenantController";

const router = express.Router();

router.get("/:clerkId", getTenantById);
router.post("/", createTenant);
router.put("/:clerkId", updateTenant);
router.get("/:clerkId/current-residences", getTenantProperty);
router.post("/:clerkId/favorites/:propertyId", addFavoriteProperty);
router.delete("/:clerkId/favorites/:propertyId", removeFavoriteProperty);

export default router;