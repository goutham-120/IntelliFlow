import Organization from "../models/Organization.js";
import Group from "../models/Group.js";
import User from "../models/User.js";
import Workflow from "../models/Workflow.js";
import Task from "../models/Task.js";
import { createServiceError } from "./serviceHelpers.js";

export const getOrganizationSummaryService = async ({ organizationId }) => {
  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw createServiceError(404, "Organization not found");
  }

  const [usersCount, groupsCount, workflowsCount, tasksCount] = await Promise.all([
    User.countDocuments({ organizationId }),
    Group.countDocuments({ organizationId }),
    Workflow.countDocuments({ organizationId }),
    Task.countDocuments({ organizationId }),
  ]);

  return {
    status: 200,
    payload: {
      organization,
      stats: {
        usersCount,
        groupsCount,
        workflowsCount,
        tasksCount,
      },
    },
  };
};

export const updateOrganizationService = async ({ organizationId, name, isActive }) => {
  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw createServiceError(404, "Organization not found");
  }

  if (name !== undefined) organization.name = name;
  if (isActive !== undefined) organization.isActive = isActive;
  await organization.save();

  return {
    status: 200,
    payload: {
      message: "Organization updated successfully",
      organization,
    },
  };
};

export default {
  getOrganizationSummaryService,
  updateOrganizationService,
};
