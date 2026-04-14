import AuditLog from "../models/AuditLog.js";
import { createServiceError } from "./serviceHelpers.js";

export const createAuditLogService = async ({
  organizationId,
  actorUserId = null,
  action,
  entityType,
  entityId = null,
  description,
  metadata = {},
  ipAddress = "",
}) => {
  const auditLog = await AuditLog.create({
    organizationId,
    actorUserId,
    action,
    entityType,
    entityId,
    description,
    metadata,
    ipAddress,
  });

  return {
    status: 201,
    payload: {
      message: "Audit log created successfully",
      auditLog,
    },
  };
};

export const getAuditLogsService = async ({
  organizationId,
  action,
  actorUserId,
  limit = 50,
}) => {
  const query = { organizationId };
  if (action) query.action = action;
  if (actorUserId) query.actorUserId = actorUserId;

  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const auditLogs = await AuditLog.find(query)
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .populate("actorUserId", "name email role");

  return {
    status: 200,
    payload: auditLogs,
  };
};

export const getAuditLogByIdService = async ({ organizationId, auditLogId }) => {
  const auditLog = await AuditLog.findOne({ _id: auditLogId, organizationId }).populate(
    "actorUserId",
    "name email role"
  );

  if (!auditLog) {
    throw createServiceError(404, "Audit log not found");
  }

  return {
    status: 200,
    payload: auditLog,
  };
};

export default {
  createAuditLogService,
  getAuditLogsService,
  getAuditLogByIdService,
};
