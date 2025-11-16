// src/app/routes/index.tsx
import { createBrowserRouter, Navigate, useParams } from "react-router-dom";

import AdminLoginPage from "./admin/auth/AdminLoginPage";
import AdminRegisterPage from "./admin/auth/AdminRegisterPage";
import AdminForgotPasswordPage from "./admin/auth/AdminForgotPasswordPage";

import SubscriptionChoice from "./admin/suscription/SuscriptionChoice";

import AdminLayout from "./admin/AdminLayout";
import HomePage from "./admin/HomePage";
import AdminHomePage from "./admin/dashboard/AdminHomePage";
import AdminDashboard from "./admin/dashboard/AdminDashboard";

// Import direct
import { ProductList } from "./admin/dashboard/ProductManagement";
import { CategoryList } from "./admin/dashboard/CategoryManagement";
import HomePageShop from "./shop/HomePageShop";
import Contact from "./shop/Contact";
import Catalogue from "./shop/Catalogue";
import ItemPage from "./shop/ItemPage";
import APropos from "./shop/aPropos";
import Cart from "./shop/Cart";

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
      // tu pourras ajouter ici orders/customers/etc. sur le même modèle
    ],
  },

  { path: "/shop/:shopId", element: <HomePageShop /> },

  { path: "/shop/:shopId/contact", element: <Contact /> },
  { path: "/shop/:shopId/apropos", element: <APropos /> },
  { path: "/shop/:shopId/catalogue", element: <Catalogue /> },
  { path: "/shop/:shopId/product/:productId", element: <ItemPage /> },
  { path: "/shop/:shopId/panier", element: <Cart /> },





  { path: "*", element: <div>404 - Page non trouvée</div> },
]);
