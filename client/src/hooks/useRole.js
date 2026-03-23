import { useMemo } from "react";
import useAuth from "./useAuth";

export default function useRole() {
  const { user } = useAuth();

  return useMemo(
    () => ({
      role: user?.role || null,
      isAdmin: user?.role === "admin",
      isUser: user?.role === "user",
    }),
    [user]
  );
}
