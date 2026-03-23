import express from "express";
import { createUser, getUsers } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rbacMiddleware.js";
import { validateCreateUser } from "../validators/userValidator.js";

const router = express.Router();

// Admin-only routes
router.post("/", protect, authorizeRoles("admin"), validateCreateUser, createUser);
router.get("/", protect, authorizeRoles("admin"), getUsers);

export default router;
