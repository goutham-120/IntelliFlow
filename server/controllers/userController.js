import { createUserService, getUsersService } from "../services/userService.js";

/**
 * @desc    Create new user inside same organization
 * @route   POST /api/users
 * @access  Admin only
 */
export const createUser = async (req, res) => {
  try {
    const result = await createUserService({
      organizationId: req.user.organizationId,
      ...req.body,
    });

    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Create User Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

/**
 * @desc    Get all users in organization
 * @route   GET /api/users
 * @access  Admin only
 */
export const getUsers = async (req, res) => {
  try {
    const result = await getUsersService({
      organizationId: req.user.organizationId,
    });

    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Get Users Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};
