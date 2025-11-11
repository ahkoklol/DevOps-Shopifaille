// src/app/routes/index.tsx
import { createBrowserRouter, Navigate, useParams } from "react-router-dom";

import AdminLoginPage from "./admin/auth/AdminLoginPage";
import AdminRegisterPage from "./admin/auth/AdminRegisterPage";
import AdminForgotPasswordPage from "./admin/auth/AdminForgotPasswordPage";

import SubscriptionChoice from "./admin/suscription/SuscriptionChoice";
import CheckoutPage from "./admin/suscription/CheckoutPage";

import AdminLayout from "./admin/AdminLayout";
import HomePage from "./admin/HomePage";
import AdminHomePage from "./admin/dashboard/AdminHomePage";
import AdminDashboard from "./admin/dashboard/AdminDashboard";
import { OrderManagement } from "./admin/dashboard/OrderManagement"; 
import CustomerManagement from "./admin/dashboard/CustomerManagement";
import { Customization } from "./admin/dashboard/Customization";
import { Settings } from "./admin/dashboard/Settings";


// Import direct
import { ProductList } from "./admin/dashboard/ProductManagement";
import { CategoryList } from "./admin/dashboard/CategoryManagement";
import HomePageShop from "./shop/HomePageShop";
import Contact from "./shop/Contact";
import Catalogue from "./shop/Catalogue";

// ⬇️ Petits wrappers internes (déclarés dans CE fichier) pour injecter le shopId param
function ProductsRoute() {
  const { shopId } = useParams();
  const saved = typeof window !== "undefined" ? sessionStorage.getItem("activeShopId") : null;
  return <ProductList shopId={shopId ?? saved ?? "1"} />;
}
function CategoriesRoute() {
  const { shopId } = useParams();
  const saved = typeof window !== "undefined" ? sessionStorage.getItem("activeShopId") : null;
  return <CategoryList shopId={shopId ?? saved ?? "1"} />;
}
function OrdersRoute() {
  const { shopId } = useParams();
  const saved = typeof window !== "undefined" ? sessionStorage.getItem("activeShopId") : null;
  return <OrderManagement shopId={shopId ?? saved ?? "1"} />;
}

// ⬇️ Internal wrapper to inject shopId param (add this near the other wrappers)
function CustomersRoute() {
  const { shopId } = useParams();
  const saved = typeof window !== "undefined" ? sessionStorage.getItem("activeShopId") : null;
  return <CustomerManagement shopId={shopId ?? saved ?? "1"} />;
}

function CustomizationRoute() {
  const { shopId } = useParams();
  const saved = typeof window !== "undefined" ? sessionStorage.getItem("activeShopId") : null;
  return <Customization shopId={shopId ?? saved ?? "1"} />;
}

function SettingsRoute() {
  const { shopId } = useParams();
  const saved = typeof window !== "undefined" ? sessionStorage.getItem("activeShopId") : null;
  return <Settings shopId={shopId ?? saved ?? "1"} />;
}


export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/homepage" replace /> },

  // Homepage publique
  { path: "/homepage", element: <HomePage /> },

  // Auth
  { path: "/admin/login", element: <AdminLoginPage /> },
  { path: "/admin/register", element: <AdminRegisterPage /> },
  { path: "/admin/forgot-password", element: <AdminForgotPasswordPage /> },

  // Souscription
  { path: "/subscribe", element: <SubscriptionChoice /> },
  { path: "/checkout", element: <CheckoutPage /> },

  // ⬇️ AdminHomePage SANS sidebar (hors layout)
  { path: "/admin/home", element: <AdminHomePage /> },

  // ⬇️ Espace admin AVEC sidebar par boutique
  {
    path: "/admin/:shopId",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "products", element: <ProductsRoute /> },
      { path: "categories", element: <CategoriesRoute /> },
      { path: "orders", element: <OrdersRoute /> },
      { path: "customers", element: <CustomersRoute /> },
      { path: "customization", element: <CustomizationRoute /> },
      { path: "settings", element: <SettingsRoute /> },
    ],
  },


  { path: "/shop/:shopId", element: <HomePageShop /> },

  { path: "/shop/:shopId/contact", element: <Contact /> },
  { path: "/shop/:shopId/catalogue", element: <Catalogue /> },




  { path: "*", element: <div>404 - Page non trouvée</div> },
]);
