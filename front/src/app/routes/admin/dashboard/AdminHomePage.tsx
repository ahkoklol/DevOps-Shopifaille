// src/app/routes/admin/dashboard/AdminHomePage.tsx
import { useNavigate } from "react-router-dom";
import { ExternalLink, Plus, Settings, Store } from "lucide-react";
import { Button } from "../../../../shared/components/ui/Button";
import { Card } from "../../../../shared/components/ui/Card";
import { getShopsByUserId } from "../../../../shared/lib/mock-data";
import { Navbar } from "../Navbar";

export default function AdminHomePage() {
  const navigate = useNavigate();
  const userShops = getShopsByUserId("1");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="platform" onNavigate={() => {/* not used on home */}} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">Mes boutiques</h1>
            <p className="text-gray-600">
              Gérez et créez vos boutiques e-commerce
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => navigate("/admin/platform/create-shop")}
          >
            <Plus className="w-5 h-5 mr-2" />
            Créer une boutique
          </Button>
        </div>

        {/* Shops Grid */}
        {userShops.length === 0
          ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">
                Aucune boutique pour le moment
              </h3>
              <p className="text-gray-600 mb-6">
                Créez votre première boutique pour commencer à vendre en ligne
              </p>
              <Button onClick={() => navigate("/admin/platform/create-shop")}>
                <Plus className="w-4 h-4 mr-2" />
                Créer ma première boutique
              </Button>
            </Card>
          )
          : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userShops.map((shop) => (
                <Card
                  key={shop.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div
                    className="h-32 flex items-center justify-center text-6xl"
                    style={{ backgroundColor: `${shop.primaryColor}20` }}
                  >
                    {shop.logo}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl text-gray-900 mb-1">
                          {shop.name}
                        </h3>
                        <p className="text-sm text-gray-500">{shop.domain}</p>
                      </div>
                      {/* Simple badge replacement */}
                      <span
                        className={shop.status === "active"
                          ? "inline-flex items-center rounded-md bg-blue-600 px-2 py-0.5 text-xs font-medium text-white"
                          : "inline-flex items-center rounded-md bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700"}
                      >
                        {shop.status === "active" ? "Active" : "Brouillon"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          sessionStorage.setItem("activeShopId", shop.id); // optionnel mais utile en fallback
                          navigate(`/admin/${shop.id}/dashboard`); // ⬅️ vers le dashboard de CETTE boutique
                        }}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Administrer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/shop/${shop.id}`)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

        {/* Quick Stats */}
        {userShops.length > 0 && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="text-gray-600 mb-1">Boutiques actives</div>
              <div className="text-3xl text-gray-900">
                {userShops.filter((s) => s.status === "active").length}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-gray-600 mb-1">Total boutiques</div>
              <div className="text-3xl text-gray-900">{userShops.length}</div>
            </Card>
            <Card className="p-6">
              <div className="text-gray-600 mb-1">Domaines configurés</div>
              <div className="text-3xl text-gray-900">{userShops.length}</div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
