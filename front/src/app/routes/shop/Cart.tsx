import { useState } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "./../../../shared/components/ui/Button.tsx";
import { Card } from "./../../../shared/components/ui/Card.tsx";
import data from "./../../../data/data.json";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "./NavBar.tsx";

interface CartItem {
  productId: string;
  quantity: number;
}

function Cart() {
  const navigate = useNavigate();
  const { shopId: paramShopId } = useParams();
  const foundShop = data.shops.find((shop) => shop.id === paramShopId);
  const products = foundShop?.featuredProducts ?? [];

  const [cartItems, setCartItems] = useState<CartItem[]>([
    { productId: "prod-1", quantity: 2 },
    { productId: "prod-3", quantity: 1 },
  ]);

  if (!foundShop) return <div>Boutique introuvable</div>;

  const cartDetails = cartItems.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      ...item,
      product,
    };
  }).filter((item) => item.product);

  const subtotal = cartDetails.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );
  const shipping = subtotal > 50 ? 0 : 5.90;
  const total = subtotal + shipping;

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCartItems((items) =>
      items.filter((item) => item.productId !== productId)
    );
  };

  if (cartDetails.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl text-gray-900 mb-3">Votre panier est vide</h2>
          <p className="text-gray-600 mb-6">
            Découvrez notre catalogue et ajoutez des produits à votre panier
          </p>
          <Button
            onClick={() => navigate(`/shop/${paramShopId}/catalogue`)}
            style={{ backgroundColor: foundShop.codeColor }}
          >
            Découvrir le catalogue
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl text-gray-900 mb-8">Panier</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartDetails.map(({ product, quantity, productId }) => {
                if (!product) return null;

                return (
                  <Card key={productId} className="p-6" data-cy="cart-item">
                    <div className="flex gap-6">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg text-gray-900">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {product.description}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              removeItem(productId)}
                            data-cy="btn-remove"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            <Button
                              data-cy="btn-minus"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantity(productId, -1)}
                              disabled={quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center text-gray-900">
                              {quantity}
                            </span>
                            <Button
                              data-cy="btn-plus"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantity(productId, 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <div
                            className="text-xl text-gray-900"
                            data-cy="quantity"
                          >
                            {(product.price * quantity).toFixed(2)} €
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl text-gray-900 mb-6">
                  Résumé de la commande
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Livraison</span>
                    <span>
                      {shipping === 0 ? "Gratuite" : `${shipping.toFixed(2)} €`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <div className="text-sm text-gray-500">
                      Livraison gratuite dès 50€ d'achat
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between text-xl text-gray-900">
                      <span>Total</span>
                      <span>{total.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mb-3"
                  size="lg"
                  style={{ backgroundColor: foundShop.codeColor }}
                  onClick={() => navigate(`/shop/${foundShop.id}/checkout`)}
                >
                  Passer la commande
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/shop/${paramShopId}/catalog`)}
                >
                  Continuer mes achats
                </Button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600">✓</span>
                    </div>
                    <span>Paiement 100% sécurisé</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600">🚚</span>
                    </div>
                    <span>Livraison sous 2-3 jours</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
