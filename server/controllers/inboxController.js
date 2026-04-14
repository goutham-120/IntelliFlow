import {
  getInboxNotificationsService,
  getUnreadInboxCountService,
  markAllInboxNotificationsReadService,
  markInboxNotificationReadService,
} from "../services/inboxService.js";
import { createController } from "./controllerHandler.js";

const withInboxUser = (req) => ({
  organizationId: req.user.organizationId,
  userId: req.user._id,
});

export const getInboxNotifications = createController(
  "Get Inbox Notifications",
  getInboxNotificationsService,
  (req) => ({
    ...withInboxUser(req),
    unreadOnly: req.query.unreadOnly === "true",
    limit: req.query.limit,
  })
);

export const getUnreadInboxCount = createController(
  "Get Inbox Unread Count",
  getUnreadInboxCountService,
  withInboxUser
);

export const markInboxNotificationRead = createController(
  "Mark Inbox Notification Read",
  markInboxNotificationReadService,
  (req) => ({
    ...withInboxUser(req),
    notificationId: req.params.notificationId,
  })
);

export const markAllInboxNotificationsRead = createController(
  "Mark All Inbox Notifications Read",
  markAllInboxNotificationsReadService,
  withInboxUser
);
