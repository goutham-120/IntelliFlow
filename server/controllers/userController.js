import {
  createUserService,
  deleteUserService,
  getUsersService,
  setUserActiveStatusService,
  updateUserService,
} from "../services/userService.js";
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

export const updateUser = createController("Update User", updateUserService, (req) => ({
  organizationId: req.user.organizationId,
  userId: req.params.userId,
  requestingUserId: req.user._id,
  updates: req.body,
}));

export const deleteUser = createController("Delete User", deleteUserService, (req) => ({
  organizationId: req.user.organizationId,
  userId: req.params.userId,
  requestingUserId: req.user._id,
}));
