import {
  FolderTree,
  LayoutDashboard,
  Package,
  Palette,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import { cn } from "../../../../shared/components/ui/utils";

interface AdminSidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  shopId: string;
}

export function AdminSidebar(
  { activeSection, onNavigate, shopId }: AdminSidebarProps,
) {
  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "products", label: "Produits", icon: Package },
    { id: "categories", label: "Catégories", icon: FolderTree },
    { id: "orders", label: "Commandes", icon: ShoppingCart, badge: "3" },
    { id: "customers", label: "Clients", icon: Users },
    { id: "customization", label: "Apparence", icon: Palette },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r bg-gray-50 h-[calc(100vh-4rem)] sticky top-16">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
          type="button"

              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-200",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs",
                    isActive ? "bg-blue-500" : "bg-blue-100 text-blue-700",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={() => window.open(`/shop/${shopId}`, "_blank")}
          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4" />
          Voir ma boutique
        </button>
      </div>
    </aside>
  );
}
