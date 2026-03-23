import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { OrgProvider } from "./context/OrgContext";

export default function App() {
  return (
    <AuthProvider>
      <OrgProvider>
        <AppRoutes />
      </OrgProvider>
    </AuthProvider>
  );
}
