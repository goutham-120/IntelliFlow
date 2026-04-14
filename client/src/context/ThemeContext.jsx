/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const value = {
    theme: "light",
    setTheme: () => {},
    toggleTheme: () => {},
    isLightTheme: true,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
