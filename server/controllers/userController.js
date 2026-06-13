import { createUserService, getUsersService,setUserActiveStatusService } from "../services/userService.js";
import { createController } from "./controllerHandler.js";

export const createUser = createController("Create User", createUserService, (req) => ({
  organizationId: req.user.organizationId,
  ...req.body,
}));

export const setUserActiveStatus = createController(
  "Update User Status",
  setUserActiveStatusService,
  (req) => ({
    organizationId: req.user.organizationId,
    userId: req.params.userId,
    isActive: req.body.isActive,
    requestingUserId: req.user._id,
  })
);

export const getUsers = createController("Get Users", getUsersService, (req) => ({
  organizationId: req.user.organizationId,
}));
