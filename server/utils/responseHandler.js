export const sendSuccess = (res, payload, status = 200) => res.status(status).json(payload);

export const sendCreated = (res, payload) => sendSuccess(res, payload, 201);

export const sendError = (res, error) =>
  res.status(error.status || error.statusCode || 500).json({
    message: error.message || "Server Error",
  });

export const sendPaginated = (res, items, meta = {}, status = 200) =>
  res.status(status).json({
    items,
    meta,
  });

export default {
  sendSuccess,
  sendCreated,
  sendError,
  sendPaginated,
};
