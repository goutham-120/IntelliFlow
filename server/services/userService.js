import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { normalizeSystemRole } from "../utils/systemRole.js";

const createServiceError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const createUserService = async ({
  organizationId,
  name,
  email,
  password,
  role,
}) => {
  const normalizedRole = normalizeSystemRole(role);
  if (normalizedRole !== "user") {
    throw createServiceError(400, "Invalid role");
  }

  const existingUser = await User.findOne({
    organizationId,
    email,
  });

  if (existingUser) {
    throw createServiceError(400, "User already exists in this organization");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const newUser = await User.create({
      organizationId,
      name,
      email,
      password: hashedPassword,
      role: normalizedRole,
    });

    return {
      status: 201,
      payload: {
        message: "User created successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
    };
  } catch (error) {
    if (error?.code === 11000) {
      throw createServiceError(400, "User already exists in this organization");
    }
    throw error;
  }
};

export const getUsersService = async ({ organizationId }) => {
  const users = await User.find({ organizationId }).select("-password");
  const payload = users.map((user) => {
    const normalizedRole = normalizeSystemRole(user.role);
    if (!normalizedRole) {
      throw createServiceError(500, "Invalid system role found");
    }

    return {
      ...user.toObject(),
      role: normalizedRole,
    };
  });

  return {
    status: 200,
    payload,
  };
};
