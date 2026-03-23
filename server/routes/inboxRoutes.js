import express from "express";

import {
  getInboxNotifications,
  getUnreadInboxCount,
  markAllInboxNotificationsRead,
  markInboxNotificationRead,
} from "../controllers/inboxController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rbacMiddleware.js";
import {
  validateInboxQuery,
  validateNotificationIdParam,
} from "../validators/inboxValidator.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorizeRoles("admin", "user"),
  validateInboxQuery,
  getInboxNotifications
);
router.get("/unread-count", protect, authorizeRoles("admin", "user"), getUnreadInboxCount);
router.patch(
  "/:notificationId/read",
  protect,
  authorizeRoles("admin", "user"),
  validateNotificationIdParam,
  markInboxNotificationRead
);
router.patch(
  "/read-all",
  protect,
  authorizeRoles("admin", "user"),
  markAllInboxNotificationsRead
);

export default router;
