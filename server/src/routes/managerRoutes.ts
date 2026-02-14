import express from "express";
import { createManager, getManagerById } from "../controllers/managerController.js";

const router = express.Router();

router.get("/:clerkId", getManagerById);
router.post("/", createManager);

export default router;