// front/src/app/routes/admin/AdminLayout.tsx
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Navbar } from "./Navbar";
import { AdminSidebar } from "./dashboard/AdminSidebar";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { shopId: paramShopId } = useParams();

  const onNavigate = (path: string) => navigate(path);

  const savedShopId = typeof window !== "undefined"
    ? sessionStorage.getItem("activeShopId")
    : null;
  const shopId = paramShopId ?? savedShopId ?? "1";

  const parts = location.pathname.split("/").filter(Boolean); // ["admin", ":shopId", "section?"]
  const activeSection = parts[2] ?? "dashboard";

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        variant="admin"
        shopName="Ma Boutique"
        shopLogo="🛍️"
        primaryColor="#3B82F6"
        onNavigate={onNavigate}
      />

      <div className="flex">
        <AdminSidebar
          activeSection={activeSection}
          onNavigate={(section) => onNavigate(`/admin/${shopId}/${section}`)}
          shopId={shopId}
        />

        <main className="flex-1 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
