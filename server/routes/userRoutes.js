import express from "express";
import {
  createUser,
  deleteUser,
  getUsers,
  setUserActiveStatus,
  updateUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rbacMiddleware.js";
import { validateCreateUser, validateUpdateUser } from "../validators/userValidator.js";


const router = express.Router();

// Admin-only routes
router.post("/", protect, authorizeRoles("admin"), validateCreateUser, createUser);
router.get("/", protect, authorizeRoles("admin"), getUsers);
router.patch("/:userId", protect, authorizeRoles("admin"), validateUpdateUser, updateUser);
router.patch("/:userId/status", protect, authorizeRoles("admin"), setUserActiveStatus);
router.delete("/:userId", protect, authorizeRoles("admin"), deleteUser);
export default router;
