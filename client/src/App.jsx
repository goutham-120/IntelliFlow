import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { OrgProvider } from "./context/OrgContext";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <OrgProvider>
          <AppRoutes />
        </OrgProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
