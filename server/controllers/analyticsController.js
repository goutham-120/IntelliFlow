import { createController } from "./controllerHandler.js";
import { getAnalyticsSummaryService } from "../services/analyticsService.js";

export const getAnalyticsSummary = createController(
  "Get Analytics Summary",
  getAnalyticsSummaryService,
  (req) => ({
    organizationId: req.user.organizationId,
    lookbackDays: req.query.lookbackDays,
  })
);
