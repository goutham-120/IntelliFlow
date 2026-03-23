import mongoose from "mongoose";

export const validateInboxQuery = (req, res, next) => {
  const { unreadOnly, limit } = req.query;

  if (unreadOnly !== undefined && unreadOnly !== "true" && unreadOnly !== "false") {
    return res.status(400).json({ message: "Invalid unreadOnly value" });
  }

  if (limit !== undefined) {
    const parsed = Number(limit);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
      return res.status(400).json({ message: "limit must be an integer between 1 and 100" });
    }
  }

  next();
};

export const validateNotificationIdParam = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.notificationId)) {
    return res.status(400).json({ message: "Invalid notification id" });
  }

  next();
};
