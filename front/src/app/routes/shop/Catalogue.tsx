import { useState } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";

import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Badge } from "../../../shared/components/ui/Badge";
import { Navbar } from "./NavBar";

import { Filter, Grid3x3, List, Star } from "lucide-react";

import datas from "../../../data/data.json";

type ShopProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  categoryId: string;
};

type ShopCategory = {
  id: string;
  name: string;
};

type Shop = {
  id: string;
  name: string;
  codeColor?: string;
  featuredProducts?: ShopProduct[];
  categories?: ShopCategory[];
};

type ShopData = {
  shops: Shop[];
};

function Catalogue() {
  const navigate = useNavigate();
  const { shopId: paramShopId } = useParams();

  const shopData = datas as ShopData;
  const foundShop = shopData.shops.find((shop) => shop.id === paramShopId);

  const products: ShopProduct[] = foundShop?.featuredProducts ?? [];
  const categories: ShopCategory[] = foundShop?.categories ?? [];

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProducts =
    selectedCategory !== null || selectedPrice !== null
      ? products
          .filter((product) =>
            selectedCategory !== null
              ? product.categoryId === selectedCategory
              : true
          )
          .filter((product) => {
            if (selectedPrice === "100") return product.price > 100;
            if (selectedPrice === "50-100") {
              return product.price >= 50 && product.price <= 100;
            }
            if (selectedPrice === "50") return product.price === 50;
            return true;
          })
      : products;

  if (!foundShop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Boutique introuvable</h1>
          <p className="text-gray-600 mt-2">ID : {paramShopId}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600"
          >
            Revenir à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="platform" onNavigate={() => {}} />
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl text-gray-900 mb-2">Notre catalogue</h1>
          <p className="text-gray-600">
            {filteredProducts.length} produit
            {filteredProducts.length > 1 ? "s" : ""} disponible
            {filteredProducts.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0">
            <Card className="p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg text-gray-900">Filtres</h3>
              </div>

              <div className="mb-6">
                <h4 className="text-sm text-gray-900 mb-3">Catégories</h4>
                <div className="space-y-2">
                  <button data-cy="filter-category"
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === null
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Tous les produits
                  </button>

                  {categories.map((category) => {
                    const count = products.filter(
                      (product) => product.categoryId === category.id
                    ).length;

                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                          selectedCategory === category.id
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-sm text-gray-900 mb-3">Prix</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="rounded"
                      onChange={(event) =>
                        setSelectedPrice(
                          event.target.checked ? "50" : null
                        )
                      }
                    />
                    Moins de 50€
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="rounded"
                      onChange={(event) =>
                        setSelectedPrice(
                          event.target.checked ? "50-100" : null
                        )
                      }
                    />
                    50€ - 100€
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="rounded"
                      onChange={(event) =>
                        setSelectedPrice(
                          event.target.checked ? "100" : null
                        )
                      }
                    />
                    Plus de 100€
                  </label>
                </div>
              </div>
            </Card>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Button data-cy="view-grid"
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button data-cy="view-list"
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              <select className="px-4 py-2 border rounded-lg text-sm">
                <option>Trier par: Pertinence</option>
                <option>Prix croissant</option>
                <option>Prix décroissant</option>
                <option>Nouveautés</option>
              </select>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-600">
                  Aucun produit dans cette catégorie
                </p>
              </Card>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                    onClick={() =>
                      navigate(`/shop/${paramShopId}/product/${product.id}`)
                    }
                  >
                    {/* Image */}
                    <div
                      className={`${
                        viewMode === "list" ? "w-48" : "aspect-square"
                      } overflow-hidden bg-gray-100`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Content */}
                    <div
                      className={`p-6 ${
                        viewMode === "list" ? "flex-1" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-3 h-3 text-yellow-400"
                            fill="currentColor"
                          />
                        ))}
                      </div>

                      <h3 className="text-lg text-gray-900 mb-2">
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xl text-gray-900">
                          {Number(product.price).toFixed(2)} €
                        </span>
                        <Button
                          size="sm"
                          style={{ backgroundColor: foundShop.codeColor }}
                        >
                          Ajouter au panier
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA / Footer avec couleur du shop */}
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

export default Catalogue;
