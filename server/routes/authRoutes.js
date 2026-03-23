import express from "express";
import { registerOrg, verifyOrg, loginUser } from "../controllers/authController.js";
import {
  validateLoginUser,
  validateRegisterOrg,
  validateVerifyOrg,
} from "../validators/authValidator.js";

const router = express.Router();

// Register Organization + Admin
router.post("/register-org", validateRegisterOrg, registerOrg);

// Verify Organization (Login Step 1)
router.post("/verify-org", validateVerifyOrg, verifyOrg);

// Login User (Login Step 2)
router.post("/login", validateLoginUser, loginUser);

export default router;
