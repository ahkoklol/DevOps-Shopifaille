// src/app/routes/admin/dashboard/AdminDashboard.tsx
import { Package, Plus, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// UI kit (same paths as your AdminDashboardPage)
import { Card } from "../../../../shared/components/ui/Card";
import { Button } from "../../../../shared/components/ui/Button";

// Mock data helpers
import {
  getCategoriesByShopId,
  getOrdersByShopId,
  getProductsByShopId,
} from "../../../../shared/lib/mock-data";

// Keep comments in English:
// - This dashboard uses a fixed shopId ("1") for now, same as AdminLayout.
// - If later you store the active shop in context, read it here instead.

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { shopId: paramShopId } = useParams();
  const saved = typeof window !== "undefined"
    ? sessionStorage.getItem("activeShopId")
    : null;
  const shopId = paramShopId ?? saved ?? "1";

  const products = getProductsByShopId(shopId);
  const orders = getOrdersByShopId(shopId);
  const categories = getCategoriesByShopId(shopId);

  const goSection = (section: string) =>
    navigate(`/admin/${shopId}/${section}`);

  const stats = [
    {
      label: "Produits",
      value: products.length,
      icon: Package,
      color: "blue",
      action: () => goSection("products"),
    },
    {
      label: "Commandes",
      value: orders.length,
      icon: ShoppingCart,
      color: "green",
      action: () => goSection("orders"),
    },
    {
      label: "Catégories",
      value: categories.length,
      icon: TrendingUp,
      color: "purple",
      action: () => goSection("categories"),
    },
    {
      label: "Clients",
      value: 156,
      icon: Users,
      color: "orange",
      action: () => goSection("customers"),
    },
  ];

  const recentOrders = orders.slice(0, 3);

  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre boutique</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={stat.action}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    colorMap[stat.color]
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="text-3xl text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl text-gray-900 mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => goSection("products")}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un produit
          </Button>
          <Button variant="outline" onClick={() => goSection("categories")}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle catégorie
          </Button>
          <Button variant="outline" onClick={() => goSection("customization")}>
            Personnaliser l'apparence
          </Button>
        </div>
      </Card>

      {/* Recent Orders */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-gray-900">Commandes récentes</h2>
          <Button variant="ghost" onClick={() => goSection("orders")}>
            Voir tout
          </Button>
        </div>

        {recentOrders.length === 0
          ? (
            <div className="text-center py-8 text-gray-500">
              Aucune commande pour le moment
            </div>
          )
          : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <div className="text-gray-900">Commande #{order.id}</div>
                    <div className="text-sm text-gray-500">{order.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900">
                      {order.total.toFixed(2)} €
                    </div>
                    <div className="text-sm text-green-600">{order.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </Card>
    </div>
  );
}
