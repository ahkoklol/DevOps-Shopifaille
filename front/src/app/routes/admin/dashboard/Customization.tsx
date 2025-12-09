import { useState } from "react";
import { useParams } from "react-router-dom";
import { Check, Eye } from "lucide-react";

// UI components (chemins adaptés à ton repo)
import { Button } from "../../../../shared/components/ui/Button";
import { Card } from "../../../../shared/components/ui/Card";
import { Input } from "../../../../shared/components/ui/Input";
import { Label } from "../../../../shared/components/ui/Label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../shared/components/ui/Tabs";

// Mock data (adapter si tu remplaces par un vrai service plus tard)
import { getShopById } from "../../../../shared/lib/mock-data";

interface CustomizationProps {
  shopId?: string;
}

export function Customization({ shopId: propShopId }: CustomizationProps) {
  const params = useParams();
  const shopId = propShopId ?? (params as { shopId?: string })?.shopId ?? "";

  const shop = getShopById(shopId);

  const [config, setConfig] = useState({
    logo: shop?.logo || "LOGO",
    primaryColor: shop?.primaryColor || "#3B82F6",
    shopName: shop?.name || "",
    slogan: shop?.description || "",
  });

  const colors = [
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#10B981",
    "#F59E0B",
    "#EF4444",
  ];

  const handleSave = () => {
    // Replace with a real mutation / API call when backend is ready
    alert("Configuration sauvegardée !");
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-gray-900 mb-2">Personnalisation</h1>
        <p className="text-gray-600">
          Personnalisez l'apparence de votre boutique
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div>
          <Tabs defaultValue="branding">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="branding">Marque</TabsTrigger>
              <TabsTrigger value="colors">Couleurs</TabsTrigger>
              <TabsTrigger value="layout">Mise en page</TabsTrigger>
            </TabsList>

            <TabsContent value="branding">
              <Card className="p-6">
                <h3 className="text-lg text-gray-900 mb-4">
                  Identité de marque
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="logo">Logo (texte court ou URL)</Label>
                    <Input
                      id="logo"
                      value={config.logo}
                      onChange={(e) =>
                        setConfig({ ...config, logo: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="shop-name">Nom de la boutique</Label>
                    <Input
                      id="shop-name"
                      value={config.shopName}
                      onChange={(e) =>
                        setConfig({ ...config, shopName: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="slogan">Slogan</Label>
                    <Input
                      id="slogan"
                      value={config.slogan}
                      onChange={(e) =>
                        setConfig({ ...config, slogan: e.target.value })}
                      placeholder="Votre message de bienvenue"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="colors">
              <Card className="p-6">
                <h3 className="text-lg text-gray-900 mb-4">
                  Couleur principale
                </h3>

                <div className="grid grid-cols-6 gap-4 mb-6">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        setConfig({ ...config, primaryColor: color })}
                      className="relative aspect-square rounded-lg border-2 transition-all hover:scale-110"
                      style={{
                        backgroundColor: color,
                        borderColor: config.primaryColor === color
                          ? "#000"
                          : "transparent",
                      }}
                      aria-label={`Choisir la couleur ${color}`}
                      type="button"
                    >
                      {config.primaryColor === color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div>
                  <Label htmlFor="custom-color">Couleur personnalisée</Label>
                  <div className="flex gap-2">
                    <Input
                      id="custom-color"
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) =>
                        setConfig({ ...config, primaryColor: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={config.primaryColor}
                      onChange={(e) =>
                        setConfig({ ...config, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="layout">
              <Card className="p-6">
                <h3 className="text-lg text-gray-900 mb-4">
                  Options de mise en page
                </h3>
                <p className="text-gray-600">
                  Fonctionnalité disponible prochainement
                </p>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex gap-3">
            <Button onClick={handleSave} className="flex-1">
              Sauvegarder les modifications
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Prévisualiser
            </Button>
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <Card className="p-6">
            <h3 className="text-lg text-gray-900 mb-4">Aperçu en temps réel</h3>

            <div className="border rounded-lg overflow-hidden">
              {/* Mock Header */}
              <div className="border-b bg-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    {config.logo}
                  </div>
                  <span className="text-gray-900">{config.shopName}</span>
                </div>
                <div
                  className="px-4 py-2 rounded-lg text-white text-sm"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  Panier
                </div>
              </div>

              {/* Mock Hero */}
              <div
                className="p-8 text-center text-white"
                style={{
                  backgroundColor: `${config.primaryColor}20`,
                  color: config.primaryColor,
                }}
              >
                <h2 className="text-2xl mb-2">
                  {config.slogan || "Bienvenue dans notre boutique"}
                </h2>
                <p className="opacity-80">
                  Découvrez nos produits exceptionnels
                </p>
              </div>

              {/* Mock Product Grid */}
              <div className="p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg overflow-hidden border"
                    >
                      <div className="aspect-square bg-gray-200" />
                      <div className="p-3">
                        <div className="h-4 bg-gray-200 rounded mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-2/3 mb-3" />
                        <button
                          className="w-full py-2 rounded text-white text-sm"
                          style={{ backgroundColor: config.primaryColor }}
                          type="button"
                        >
                          Ajouter au panier
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
