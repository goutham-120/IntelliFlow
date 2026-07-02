import express from "express";
import {
  loginUser,
  loginUserWithGoogle,
  registerOrg,
  registerOrgWithGoogle,
  verifyOrg,
} from "../controllers/authController.js";
import {
  validateGoogleLoginUser,
  validateGoogleRegisterOrg,
  validateLoginUser,
  validateRegisterOrg,
  validateVerifyOrg,
} from "../validators/authValidator.js";

const router = express.Router();

// Register Organization + Admin
router.post("/register-org", validateRegisterOrg, registerOrg);
router.post("/register-org/google", validateGoogleRegisterOrg, registerOrgWithGoogle);

// Verify Organization (Login Step 1)
router.post("/verify-org", validateVerifyOrg, verifyOrg);

// Login User (Login Step 2)
router.post("/login", validateLoginUser, loginUser);
router.post("/login/google", validateGoogleLoginUser, loginUserWithGoogle);

export default router;
