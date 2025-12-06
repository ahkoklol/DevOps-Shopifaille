// src/app/routes/index.tsx
/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate, useParams } from "react-router-dom";

import AdminLoginPage from "./admin/auth/AdminLoginPage.tsx";
import AdminRegisterPage from "./admin/auth/AdminRegisterPage.tsx";
import AdminForgotPasswordPage from "./admin/auth/AdminForgotPasswordPage.tsx";

import SubscriptionChoice from "./admin/suscription/SuscriptionChoice.tsx";
import CheckoutPage from "./admin/suscription/CheckoutPage.tsx";

import AdminLayout from "./admin/AdminLayout.tsx";
import HomePage from "./admin/HomePage.tsx";
import AdminHomePage from "./admin/dashboard/AdminHomePage.tsx";
import AdminDashboard from "./admin/dashboard/AdminDashboard.tsx";
import { OrderManagement } from "./admin/dashboard/OrderManagement.tsx";
import CustomerManagement from "./admin/dashboard/CustomerManagement.tsx";
import { Customization } from "./admin/dashboard/Customization.tsx";
import { Settings } from "./admin/dashboard/Settings.tsx";
import {
  CreateShopPage,
  ShopCreatedPage,
} from "./admin/platfom/CreateShopPage.tsx";

// Import direct
import { ProductList } from "./admin/dashboard/ProductManagement.tsx";
import { CategoryList } from "./admin/dashboard/CategoryManagement.tsx";
import HomePageShop from "./shop/HomePageShop.tsx";
import Contact from "./shop/Contact.tsx";
import Catalogue from "./shop/Catalogue.tsx";
import ItemPage from "./shop/ItemPage.tsx";
import APropos from "./shop/aPropos.tsx";
import Cart from "./shop/Cart.tsx";

// ⬇️ Petits wrappers internes (déclarés dans CE fichier) pour injecter le shopId param
function ProductsRoute() {
  const { shopId } = useParams();
  const saved = typeof window !== "undefined"
    ? sessionStorage.getItem("activeShopId")
    : null;
  return <ProductList shopId={shopId ?? saved ?? "1"} />;
}
function CategoriesRoute() {
  const { shopId } = useParams();
  const saved = typeof window !== "undefined"
    ? sessionStorage.getItem("activeShopId")
    : null;
  return <CategoryList shopId={shopId ?? saved ?? "1"} />;
}
function OrdersRoute() {
  const { shopId } = useParams();
  const saved = typeof window !== "undefined"
    ? sessionStorage.getItem("activeShopId")
    : null;
  return <OrderManagement shopId={shopId ?? saved ?? "1"} />;
}

// ⬇️ Internal wrapper to inject shopId param (add this near the other wrappers)
function CustomersRoute() {
  const { shopId } = useParams();
  const saved = typeof window !== "undefined"
    ? sessionStorage.getItem("activeShopId")
    : null;
  return <CustomerManagement shopId={shopId ?? saved ?? "1"} />;
}

function CustomizationRoute() {
  const { shopId } = useParams();
  const saved = typeof window !== "undefined"
    ? sessionStorage.getItem("activeShopId")
    : null;
  return <Customization shopId={shopId ?? saved ?? "1"} />;
}

function SettingsRoute() {
  const { shopId } = useParams();
  const saved = typeof window !== "undefined"
    ? sessionStorage.getItem("activeShopId")
    : null;
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
  { path: "/admin/platform/create-shop", element: <CreateShopPage /> },
  { path: "/admin/platform/shop-created", element: <ShopCreatedPage /> },

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
  { path: "/shop/:shopId/apropos", element: <APropos /> },
  { path: "/shop/:shopId/catalogue", element: <Catalogue /> },
  { path: "/shop/:shopId/product/:productId", element: <ItemPage /> },
  { path: "/shop/:shopId/panier", element: <Cart /> },

  { path: "*", element: <div>404 - Page non trouvée</div> },
]);
