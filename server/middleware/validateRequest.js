export const validateRequest =
  (validator) =>
  async (req, res, next) => {
    try {
      const result = await validator(req);

      if (result === true || result === undefined || result === null) {
        return next();
      }

      if (typeof result === "string") {
        return res.status(400).json({ message: result });
      }

      if (result && typeof result === "object") {
        return res.status(result.status || 400).json({
          message: result.message || "Invalid request",
          ...(result.errors ? { errors: result.errors } : {}),
        });
      }

      return next();
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Invalid request",
      });
    }
  };

export default validateRequest;
