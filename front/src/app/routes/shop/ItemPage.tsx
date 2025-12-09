import { useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";

import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Navbar } from "./NavBar";

import { Heart, Minus, Plus, Share2, ShoppingCart, Star } from "lucide-react";

import datas from "../../../data/data.json";

function ItemPage() {
  const navigate = useNavigate();
  const { shopId, productId } = useParams<
    { shopId: string; productId: string }
  >();
  const foundShop = datas.shops.find((shop) => shop.id === shopId);
  const product = foundShop?.featuredProducts.find((prod) =>
    prod.id === productId
  );
  const [quantity, setQuantity] = useState(1);

  if (!foundShop || !product) {
    return <div className="p-8">{shopId} {productId}</div>;
  }

  const handleAddToCart = () => {
    alert(`${quantity} × ${product.name} ajouté au panier !`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="platform" onNavigate={() => {}} />

      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
            <button
              type="button"
              onClick={() => navigate(`/shop/${foundShop.id}`)}
              className="hover:text-gray-900"
            >
              Accueil
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => navigate(`/shop/${foundShop.id}/catalog`)}
              className="hover:text-gray-900"
            >
              Catalogue
            </button>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {product.othersImages.map((i) => (
                  <button
                    type="button"
                    key={i}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent hover:border-blue-500 transition-colors"
                  >
                    <img
                      src={i}
                      alt={`${product.name} ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="text-gray-600">(124 avis)</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl text-gray-900">
                  {product.price.toFixed(2)} €
                </span>
              </div>

              <div className="prose mb-8">
                <h3 className="text-lg text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
                <ul className="text-gray-600 mt-4">
                  <li>Livraison gratuite dès 50€</li>
                  <li>Retour sous 30 jours</li>
                  <li>Garantie 2 ans</li>
                </ul>
              </div>

              <Card className="p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-gray-900">Quantité:</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center text-gray-900">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  style={{ backgroundColor: foundShop?.codeColor }}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Ajouter au panier
                </Button>
              </Card>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">✓</div>
                  <div className="text-xs text-gray-600">Paiement sécurisé</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">🚚</div>
                  <div className="text-xs text-gray-600">Livraison rapide</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">↩</div>
                  <div className="text-xs text-gray-600">Retour gratuit</div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-12">
            <h2 className="text-2xl text-gray-900 mb-6">Avis clients</h2>

            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <div className="text-gray-900">Marie L.</div>
                    </div>
                    <div className="text-sm text-gray-500">Il y a 2 jours</div>
                  </div>
                  <p className="text-gray-700">
                    Excellent produit ! Très satisfaite de mon achat. La qualité
                    est au rendez-vous et la livraison a été rapide.
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

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
export default ItemPage;
