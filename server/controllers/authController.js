import {
  loginUserService,
  loginUserWithGoogleService,
  registerOrgService,
  registerOrgWithGoogleService,
  verifyOrgService,
} from "../services/authService.js";
import { createController } from "./controllerHandler.js";

export const registerOrg = createController("Register Org", registerOrgService);
export const registerOrgWithGoogle = createController("Register Org With Google", registerOrgWithGoogleService);
export const verifyOrg = createController("Verify Org", verifyOrgService);
export const loginUser = createController("Login", loginUserService);
export const loginUserWithGoogle = createController("Google Login", loginUserWithGoogleService);
