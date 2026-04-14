import { loginUserService, registerOrgService, verifyOrgService } from "../services/authService.js";
import { createController } from "./controllerHandler.js";

export const registerOrg = createController("Register Org", registerOrgService);
export const verifyOrg = createController("Verify Org", verifyOrgService);
export const loginUser = createController("Login", loginUserService);
