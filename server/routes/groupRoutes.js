import express from "express";
import {
  addGroupMember,
  assignTaskToGroup,
  createGroup,
  getGroupMembers,
  getGroups,
  getUserGroups,
  removeGroupMember,
  updateGroup,
  updateGroupMemberRole,
} from "../controllers/groupController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rbacMiddleware.js";
import {
  validateAssignTaskBody,
  validateCreateGroup,
  validateGroupIdParam,
  validateMembershipCreate,
  validateMembershipRoleUpdate,
  validateUpdateGroup,
  validateUserIdParam,
} from "../validators/groupValidator.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("admin"), validateCreateGroup, createGroup);
router.get("/", protect, authorizeRoles("admin", "user"), getGroups);
router.patch(
  "/:groupId",
  protect,
  authorizeRoles("admin"),
  validateGroupIdParam,
  validateUpdateGroup,
  updateGroup
);

router.get(
  "/:groupId/members",
  protect,
  authorizeRoles("admin", "user"),
  validateGroupIdParam,
  getGroupMembers
);
router.post(
  "/:groupId/members",
  protect,
  authorizeRoles("admin"),
  validateGroupIdParam,
  validateMembershipCreate,
  addGroupMember
);
router.patch(
  "/:groupId/members/:userId/role",
  protect,
  authorizeRoles("admin"),
  validateGroupIdParam,
  validateMembershipRoleUpdate,
  updateGroupMemberRole
);
router.delete(
  "/:groupId/members/:userId",
  protect,
  authorizeRoles("admin"),
  validateGroupIdParam,
  validateUserIdParam,
  removeGroupMember
);

router.get(
  "/users/:userId",
  protect,
  authorizeRoles("admin", "user"),
  validateUserIdParam,
  getUserGroups
);

router.post(
  "/:groupId/assign-task",
  protect,
  authorizeRoles("admin", "user"),
  validateGroupIdParam,
  validateAssignTaskBody,
  assignTaskToGroup
);

export default router;
