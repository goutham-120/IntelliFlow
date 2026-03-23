import express from "express";

import {
  createWorkflow,
  getWorkflowById,
  getWorkflows,
  updateWorkflow,
} from "../controllers/workflowController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rbacMiddleware.js";
import {
  validateCreateWorkflow,
  validateUpdateWorkflow,
  validateWorkflowIdParam,
} from "../validators/workflowValidator.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("admin"), validateCreateWorkflow, createWorkflow);
router.get("/", protect, authorizeRoles("admin", "user"), getWorkflows);
router.get(
  "/:workflowId",
  protect,
  authorizeRoles("admin", "user"),
  validateWorkflowIdParam,
  getWorkflowById
);
router.patch(
  "/:workflowId",
  protect,
  authorizeRoles("admin"),
  validateWorkflowIdParam,
  validateUpdateWorkflow,
  updateWorkflow
);

export default router;
