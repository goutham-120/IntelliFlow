import {
  loginUserService,
  registerOrgService,
  verifyOrgService,
} from "../services/authService.js";

export const registerOrg = async (req, res) => {
  try {
    const result = await registerOrgService(req.body);
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Register Org Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const verifyOrg = async (req, res) => {
  try {
    const result = await verifyOrgService(req.body);
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Verify Org Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const result = await loginUserService(req.body);
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};
