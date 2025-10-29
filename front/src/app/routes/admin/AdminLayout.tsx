import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Store, Settings, LayoutDashboard, Package } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { cn } from "../../../shared/components/ui/utils";

/**
 * Layout principal du back-office.
 * Structure : sidebar + contenu principal.
 */
export default function AdminLayout() {
  const navigate = useNavigate();

  // (Optionnel) Logout simple
  const handleLogout = () => {
    // TODO: Clear auth token / localStorage
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      {/* --- Sidebar --- */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="flex items-center gap-2 px-6 py-5 border-b">
          <Store className="w-6 h-6 text-blue-600" />
          <span className="font-semibold text-lg">Admin Panel</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-4">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-blue-50 hover:text-blue-700",
                isActive && "bg-blue-100 text-blue-700 font-medium"
              )
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            Tableau de bord
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-blue-50 hover:text-blue-700",
                isActive && "bg-blue-100 text-blue-700 font-medium"
              )
            }
          >
            <Package className="w-4 h-4" />
            Produits
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-blue-50 hover:text-blue-700",
                isActive && "bg-blue-100 text-blue-700 font-medium"
              )
            }
          >
            <Settings className="w-4 h-4" />
            Paramètres
          </NavLink>
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* --- Contenu principal --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
