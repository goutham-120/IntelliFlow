import express from "express";
import { createUser, getUsers } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rbacMiddleware.js";
import { validateCreateUser } from "../validators/userValidator.js";
import { setUserActiveStatus } from "../controllers/userController.js";


const router = express.Router();

// Admin-only routes
router.post("/", protect, authorizeRoles("admin"), validateCreateUser, createUser);
router.get("/", protect, authorizeRoles("admin"), getUsers);
router.patch("/:userId/status", protect, authorizeRoles("admin"), setUserActiveStatus);
export default router;
