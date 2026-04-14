import { createUserService, getUsersService } from "../services/userService.js";
import { createController } from "./controllerHandler.js";

export const createUser = createController("Create User", createUserService, (req) => ({
  organizationId: req.user.organizationId,
  ...req.body,
}));

export const getUsers = createController("Get Users", getUsersService, (req) => ({
  organizationId: req.user.organizationId,
}));
