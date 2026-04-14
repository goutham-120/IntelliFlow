import { logger } from "../config/logger.js";
import { sendError, sendSuccess } from "../utils/responseHandler.js";

export const createController = (label, service, buildArgs = (req) => req.body) => async (req, res) => {
  try {
    const result = await service(await buildArgs(req));
    sendSuccess(res, result.payload, result.status);
  } catch (error) {
    logger.error(`${label} Error`, {
      message: error.message,
      path: req.originalUrl,
      method: req.method,
    });
    sendError(res, error);
  }
};
