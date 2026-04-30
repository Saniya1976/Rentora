import express from "express";
import { getProperties, getProperty, createProperty, updateProperty, deleteProperty } from "../controllers/propertyController";
import { authMiddleware } from "../middleware/authMiddleware";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);
router.post("/", authMiddleware(["manager"]), upload.array("images"), createProperty);
router.put("/:id", authMiddleware(["manager"]), upload.array("images"), updateProperty);
router.delete("/:id", authMiddleware(["manager"]), deleteProperty);

export default router;