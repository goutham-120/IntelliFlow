import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Organization from "../models/Organization.js";
import User from "../models/User.js";
import { createServiceError } from "./serviceHelpers.js";
import { verifyGoogleCredential } from "./googleAuthService.js";
import { normalizeSystemRole } from "../utils/systemRole.js";

const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      organizationId: user.organizationId,
      role: normalizeSystemRole(user.role),
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

export const registerOrgService = async ({
  orgName,
  orgCode,
  adminName,
  adminEmail,
  adminPassword,
}) => {
  const existingOrg = await Organization.findOne({ orgCode });
  if (existingOrg) {
    throw createServiceError(400, "Organization code already exists");
  }

  const organization = await Organization.create({
    name: orgName,
    orgCode,
  });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  const adminUser = await User.create({
    organizationId: organization._id,
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: "admin",
  });

  const token = generateToken(adminUser);

  return {
    status: 201,
    payload: {
      message: "Organization and Admin created successfully",
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        organizationId: organization._id,
        orgCode: organization.orgCode,
      },
    },
  };
};

export const registerOrgWithGoogleService = async ({
  orgName,
  orgCode,
  adminName,
  credential,
}) => {
  const googleAccount = await verifyGoogleCredential(credential);

  const existingOrg = await Organization.findOne({ orgCode });
  if (existingOrg) {
    throw createServiceError(400, "Organization code already exists");
  }

  const organization = await Organization.create({
    name: orgName,
    orgCode,
  });

  try {
    const adminUser = await User.create({
      organizationId: organization._id,
      name: adminName || googleAccount.name,
      email: googleAccount.email,
      role: "admin",
      authProvider: "google",
      googleSubject: googleAccount.googleSubject,
      emailVerified: true,
    });

    const token = generateToken(adminUser);

    return {
      status: 201,
      payload: {
        message: "Organization and verified Google admin created successfully",
        token,
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          organizationId: organization._id,
          orgCode: organization.orgCode,
        },
      },
    };
  } catch (error) {
    await Organization.deleteOne({ _id: organization._id });
    throw error;
  }
};

export const verifyOrgService = async ({ orgCode }) => {
  const organization = await Organization.findOne({ orgCode });

  if (!organization) {
    throw createServiceError(404, "Organization not found");
  }

  return {
    status: 200,
    payload: {
      message: "Organization verified",
      organization: {
        id: organization._id,
        name: organization.name,
        orgCode: organization.orgCode,
      },
    },
  };
};

export const loginUserService = async ({ orgCode, email, password, role }) => {
  const organization = await Organization.findOne({ orgCode });
  if (!organization) {
    throw createServiceError(404, "Organization not found");
  }

  const normalizedInputRole = normalizeSystemRole(role);
  if (!normalizedInputRole) {
    throw createServiceError(400, "Invalid role");
  }

  const user = await User.findOne({
    organizationId: organization._id,
    email,
    role: normalizedInputRole,
  });

  if (!user) {
    throw createServiceError(404, "User not found for this role");
  }

  if (!user.password) {
    throw createServiceError(401, "Use Google sign-in for this account");
  }

  if (user.isActive === false) {
    throw createServiceError(403, "User account is inactive");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createServiceError(401, "Invalid password");
  }

  const normalizedRole = normalizeSystemRole(user.role);
  if (!normalizedRole) {
    throw createServiceError(403, "Invalid system role");
  }

  const token = generateToken(user);

  return {
    status: 200,
    payload: {
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: normalizedRole,
        organizationId: organization._id,
        orgCode: organization.orgCode,
      },
    },
  };
};

export const loginUserWithGoogleService = async ({ orgCode, credential, role }) => {
  const googleAccount = await verifyGoogleCredential(credential);

  const organization = await Organization.findOne({ orgCode });
  if (!organization) {
    throw createServiceError(404, "Organization not found");
  }

  const normalizedInputRole = normalizeSystemRole(role);
  if (!normalizedInputRole) {
    throw createServiceError(400, "Invalid role");
  }

  const user = await User.findOne({
    organizationId: organization._id,
    email: googleAccount.email,
    role: normalizedInputRole,
  });

  if (!user) {
    throw createServiceError(404, "No workspace user matches this verified Google account");
  }

  if (user.isActive === false) {
    throw createServiceError(403, "User account is inactive");
  }

  if (user.googleSubject && user.googleSubject !== googleAccount.googleSubject) {
    throw createServiceError(401, "This email is linked to a different Google account");
  }

  if (!user.googleSubject) {
    user.googleSubject = googleAccount.googleSubject;
  }

  user.authProvider = "google";
  user.emailVerified = true;
  if (!user.name && googleAccount.name) {
    user.name = googleAccount.name;
  }
  await user.save();

  const normalizedRole = normalizeSystemRole(user.role);
  if (!normalizedRole) {
    throw createServiceError(403, "Invalid system role");
  }

  const token = generateToken(user);

  return {
    status: 200,
    payload: {
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: normalizedRole,
        organizationId: organization._id,
        orgCode: organization.orgCode,
      },
    },
  };
};
