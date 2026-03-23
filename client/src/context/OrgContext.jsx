/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from "react";
import { useAuthContext } from "./AuthContext";

const OrgContext = createContext(null);

export function OrgProvider({ children }) {
  const { user } = useAuthContext();

  const value = useMemo(
    () => ({
      organizationId: user?.organizationId || null,
      orgCode: user?.orgCode || null,
      orgName: user?.orgName || null,
    }),
    [user]
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrgContext() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error("useOrgContext must be used within an OrgProvider");
  }
  return context;
}
