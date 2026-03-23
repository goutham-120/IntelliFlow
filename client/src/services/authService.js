import api from "./api";

// Register Organization + Admin
export const registerOrganization = async (data) => {
  const response = await api.post("/auth/register-org", data);
  return response.data;
};

// Verify Organization (Login Step 1)
export const verifyOrganization = async (orgCode) => {
  const response = await api.post("/auth/verify-org", { orgCode });
  return response.data;
};

// Login User
export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};
