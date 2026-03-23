import {
  getInboxNotificationsService,
  getUnreadInboxCountService,
  markAllInboxNotificationsReadService,
  markInboxNotificationReadService,
} from "../services/inboxService.js";

export const getInboxNotifications = async (req, res) => {
  try {
    const result = await getInboxNotificationsService({
      organizationId: req.user.organizationId,
      userId: req.user._id,
      unreadOnly: req.query.unreadOnly === "true",
      limit: req.query.limit,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Get Inbox Notifications Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const getUnreadInboxCount = async (req, res) => {
  try {
    const result = await getUnreadInboxCountService({
      organizationId: req.user.organizationId,
      userId: req.user._id,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Get Inbox Unread Count Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const markInboxNotificationRead = async (req, res) => {
  try {
    const result = await markInboxNotificationReadService({
      organizationId: req.user.organizationId,
      userId: req.user._id,
      notificationId: req.params.notificationId,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Mark Inbox Notification Read Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const markAllInboxNotificationsRead = async (req, res) => {
  try {
    const result = await markAllInboxNotificationsReadService({
      organizationId: req.user.organizationId,
      userId: req.user._id,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Mark All Inbox Notifications Read Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};
