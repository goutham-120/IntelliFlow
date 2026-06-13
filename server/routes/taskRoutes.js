import express from "express";

import {
  completeTaskStage,
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  rejectTaskStage,
  updateTask,
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rbacMiddleware.js";
import {
  validateCompleteTaskStage,
  validateCreateTask,
  validateTaskIdParam,
  validateTaskQuery,
  validateUpdateTask,
} from "../validators/taskValidator.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("admin", "user"), validateCreateTask, createTask);
router.get("/", protect, authorizeRoles("admin", "user"), validateTaskQuery, getTasks);
router.get(
  "/:taskId",
  protect,
  authorizeRoles("admin", "user"),
  validateTaskIdParam,
  getTaskById
);
router.patch(
  "/:taskId",
  protect,
  authorizeRoles("admin"),
  validateTaskIdParam,
  validateUpdateTask,
  updateTask
);
router.post(
  "/:taskId/complete-stage",
  protect,
  authorizeRoles("admin", "user"),
  validateTaskIdParam,
  validateCompleteTaskStage,
  completeTaskStage
);
router.post(
  "/:taskId/reject-stage",
  protect,
  authorizeRoles("admin", "user"),
  validateTaskIdParam,
  validateCompleteTaskStage,
  rejectTaskStage
);
router.delete(
  "/:taskId",
  protect,
  authorizeRoles("admin"),
  validateTaskIdParam,
  deleteTask
);

export default router;
