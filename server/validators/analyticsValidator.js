export const validateAnalyticsQuery = (req, res, next) => {
  const { lookbackDays } = req.query;

  if (lookbackDays !== undefined) {
    const parsed = Number(lookbackDays);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 90) {
      return res.status(400).json({
        message: "lookbackDays must be an integer between 1 and 90",
      });
    }
    req.query.lookbackDays = parsed;
  }

  return next();
};
