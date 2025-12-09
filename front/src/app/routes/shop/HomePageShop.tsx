import { ArrowRight, Heart, Star, Timer } from "lucide-react";
import { Card } from "../../../shared/components/ui/Card.tsx";
import { Navbar } from "./NavBar.tsx";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import datas from "../../../data/data.json";

const ICONS = {
  Timer,
  Star,
  Heart,
};

function HomePageShop() {
  const navigate = useNavigate();
  const { shopId: paramShopId } = useParams();
  const foundShop = datas.shops.find((shop) => shop.id === paramShopId);

  if (!foundShop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Boutique introuvable</h1>
          <p className="text-gray-600 mt-2">ID : {paramShopId}</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600"
          >
            Revenir à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const mappedFeatures = (foundShop.features || []).map((f) => ({
    ...f,
    Icon: ICONS[f.icon as keyof typeof ICONS] ?? Star,
  }));

  const featuredProducts = foundShop?.featuredProducts ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b">
      <Navbar variant="platform" onNavigate={() => {}} />

      {/* Hero Section */}
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16"
        style={{
          background: foundShop.codeColor
            ? `linear-gradient(180deg, ${foundShop.codeColor}22, ${foundShop.codeColor}11)`
            : undefined,
        }}
      >
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center text-4xl text-white"
          style={{ backgroundColor: foundShop.codeColor }}
        >
          {foundShop.logo}
        </div>

        <div className="text-center">
          <h1 className="text-5xl md:text-6xl text-gray-900 mb-6 max-w-4xl mx-auto">
            {foundShop?.description}
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {foundShop?.subdescription}
          </p>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => navigate(`/shop/${foundShop.id}/catalogue`)}
              className="flex items-center gap-2 text-white px-6 py-3 rounded-2xl font-medium text-lg"
              style={{ backgroundColor: foundShop?.codeColor || "#3B82F6" }}
            >
              Découvrir le catalogue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold">
            Produits en vedette
          </h2>
          <p className="text-gray-600 mt-2">
            Découvrez notre sélection du moment
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((p) => {
            const price = typeof p.price === "number"
              ? p.price
              : Number(p.price ?? 0);

            return (
              <div
                key={p.id}
                className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm"
              >
                <Card
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() =>
                    navigate(`/shop/${paramShopId}/product/${p.id}`)}
                >
                  <div className="flex justify-center items-center">
                    <img
                      src={p.image}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {p.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-lg font-semibold">
                        {price.toFixed(2)} €
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/shop/${foundShop.id}/product/${p.id}`)}
                        className="px-3 py-1.5 text-sm rounded-xl bg-purple-500 text-white hover:bg-purple-600"
                      >
                        Voir
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {mappedFeatures.map((feature, index) => (
            <Card
              key={index}
              className="p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="text-white py-16"
        style={{ backgroundColor: foundShop.codeColor ?? "#000" }}
      >
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-3xl font-semibold">{foundShop.name}</h2>
          </div>
          <p className="mt-8 text-sm">
            © 2025 {foundShop.name}. Tous droits réservés.
          </p>
        </div>
      </div>

      <Outlet />
    </div>
  );
}

export default HomePageShop;
