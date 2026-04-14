import express from "express";

import { getAnalyticsSummary } from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rbacMiddleware.js";
import { validateAnalyticsQuery } from "../validators/analyticsValidator.js";

const router = express.Router();

router.get(
  "/summary",
  protect,
  authorizeRoles("admin", "user"),
  validateAnalyticsQuery,
  getAnalyticsSummary
);

export default router;
