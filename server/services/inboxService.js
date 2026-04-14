import mongoose from "mongoose";

import Notification from "../models/Notification.js";
import { createServiceError } from "./serviceHelpers.js";

export const getInboxNotificationsService = async ({
  organizationId,
  userId,
  unreadOnly = false,
  limit = 30,
}) => {
  const query = {
    organizationId,
    recipientUserId: userId,
  };
  if (unreadOnly) {
    query.isRead = false;
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 100);
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .populate("taskId", "title stageName status");

  return {
    status: 200,
    payload: notifications,
  };
};

export const getUnreadInboxCountService = async ({ organizationId, userId }) => {
  const unreadCount = await Notification.countDocuments({
    organizationId,
    recipientUserId: userId,
    isRead: false,
  });

  return {
    status: 200,
    payload: { unreadCount },
  };
};

export const markInboxNotificationReadService = async ({
  organizationId,
  userId,
  notificationId,
}) => {
  if (!mongoose.isValidObjectId(notificationId)) {
    throw createServiceError(400, "Invalid notification id");
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    organizationId,
    recipientUserId: userId,
  });
  if (!notification) {
    throw createServiceError(404, "Notification not found");
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  return {
    status: 200,
    payload: {
      message: "Notification marked as read",
      notification,
    },
  };
};

export const markAllInboxNotificationsReadService = async ({ organizationId, userId }) => {
  const now = new Date();
  const result = await Notification.updateMany(
    {
      organizationId,
      recipientUserId: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: now,
      },
    }
  );

  return {
    status: 200,
    payload: {
      message: "All notifications marked as read",
      updatedCount: result.modifiedCount ?? 0,
    },
  };
};
