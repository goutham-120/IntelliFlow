import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { createServiceError } from "./serviceHelpers.js";
import { normalizeSystemRole } from "../utils/systemRole.js";

export const createUserService = async ({
  organizationId,
  name,
  email,
  password,
  role,
}) => {
  const normalizedRole = normalizeSystemRole(role);
  if (!normalizedRole) {
    throw createServiceError(400, "Invalid role");
  }

  const existingUser = await User.findOne({
    organizationId,
    email,
  });

  if (existingUser) {
    throw createServiceError(400, "User already exists in this organization");
  }

  const hashedPassword = password
    ? await bcrypt.hash(password, await bcrypt.genSalt(10))
    : undefined;

  try {
    const newUser = await User.create({
      organizationId,
      name,
      email,
      password: hashedPassword,
      authProvider: hashedPassword ? "password" : "google",
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

export const updateUserService = async ({
  organizationId,
  userId,
  requestingUserId,
  updates,
}) => {
  const user = await User.findOne({ _id: userId, organizationId });
  if (!user) {
    throw createServiceError(404, "User not found");
  }

  if (updates.email && updates.email !== user.email) {
    const existingUser = await User.findOne({
      organizationId,
      email: updates.email,
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw createServiceError(400, "User already exists in this organization");
    }
  }

  if (updates.role && String(userId) === String(requestingUserId)) {
    throw createServiceError(400, "You cannot change your own role");
  }

  if (updates.isActive !== undefined && String(userId) === String(requestingUserId)) {
    throw createServiceError(400, "You cannot change your own active status");
  }

  if (updates.name !== undefined) user.name = updates.name;
  if (updates.email !== undefined) user.email = updates.email;
  if (updates.role !== undefined) user.role = updates.role;
  if (updates.isActive !== undefined) user.isActive = updates.isActive;
  if (updates.password !== undefined) {
    user.password = await bcrypt.hash(updates.password, await bcrypt.genSalt(10));
    user.authProvider = user.googleSubject ? "google" : "password";
  }

  await user.save();

  return {
    status: 200,
    payload: {
      message: "User updated successfully",
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: normalizeSystemRole(user.role),
        isActive: user.isActive,
        authProvider: user.authProvider,
      },
    },
  };
};

export const deleteUserService = async ({
  organizationId,
  userId,
  requestingUserId,
}) => {
  if (String(userId) === String(requestingUserId)) {
    throw createServiceError(400, "You cannot delete your own account");
  }

  const user = await User.findOne({ _id: userId, organizationId });
  if (!user) {
    throw createServiceError(404, "User not found");
  }

  await User.deleteOne({ _id: userId, organizationId });

  return {
    status: 200,
    payload: {
      message: "User deleted successfully",
      userId,
    },
  };
};

// ─── NEW: Activate / Deactivate a user ────────────────────────────────────────
//
// We never hard-delete users (preserves task/workflow history & references).
// Instead we flip `isActive`. requestingUserId prevents an admin from
// deactivating their own account by mistake.

export const setUserActiveStatusService = async ({
  organizationId,
  userId,
  isActive,
  requestingUserId,
}) => {
  if (String(userId) === String(requestingUserId)) {
    throw createServiceError(400, "You cannot change your own active status");
  }

  const user = await User.findOne({ _id: userId, organizationId });
  if (!user) {
    throw createServiceError(404, "User not found");
  }

  user.isActive = isActive;
  await user.save();

  return {
    status: 200,
    payload: {
      message: isActive ? "User activated successfully" : "User deactivated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    },
  };
};
