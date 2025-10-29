// src/app/routes/index.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";

// --- Admin (auth) ---
import AdminLoginPage from "./admin/auth/AdminLoginPage";
import AdminRegisterPage from "./admin/auth/AdminRegisterPage";
import AdminForgotPasswordPage from "./admin/auth/AdminForgotPasswordPage";

// --- Admin (protected area) ---
import AdminLayout from "./admin/AdminLayout";
import AdminDashboardPage from "./admin/dashboard/AdminDashboardPage";
// import AdminSettingsPage from "./admin/settings/AdminSettingsPage";

export const router = createBrowserRouter([
  // Redirect root -> admin login for now
  { path: "/", element: <Navigate to="/admin/login" replace /> },

  // Public admin auth routes
  { path: "/admin/login", element: <AdminLoginPage /> },
  { path: "/admin/register", element: <AdminRegisterPage /> },
  { path: "/admin/forgot-password", element: <AdminForgotPasswordPage /> },

  // Admin protected area
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboardPage /> },
      // { path: "settings", element: <AdminSettingsPage /> },
    ],
  },

  // Fallback 404
  { path: "*", element: <div>404 - Page non trouvée</div> },
]);
