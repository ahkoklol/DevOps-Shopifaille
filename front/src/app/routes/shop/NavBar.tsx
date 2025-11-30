import { useNavigate, useParams } from "react-router-dom";
import datas from "../../../data/data.json";

interface NavbarProps {
  variant?: "platform" | "admin" | "shop";
  shopName?: string;
  shopLogo?: string;
  primaryColor?: string;
  onNavigate?: (path: string) => void;
}

export function Navbar({
  variant = "shop",
  shopName,
  shopLogo,
  primaryColor,
  onNavigate,
}: NavbarProps) {
  const navigate = useNavigate();
  const { shopId } = useParams<{ shopId: string }>();

  const foundShop = datas.shops.find((shop) => shop.id === shopId);

  const effectiveName = foundShop?.name ?? shopName ?? "Boutique";
  const effectiveLogo = foundShop?.logo ?? shopLogo ?? "🛍️";
  const effectiveColor =
    foundShop?.codeColor ?? primaryColor ?? "#3B82F6";

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  return (
    <nav
      className={`border-b bg-white sticky top-0 z-50 ${
        variant === "admin" ? "admin-nav" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => handleNavigate(`/shop/${shopId}`)}
            className="flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl"
              style={{ backgroundColor: effectiveColor }}
            >
              {effectiveLogo}
            </div>
            <span className="text-gray-900">{effectiveName}</span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleNavigate(`/shop/${shopId}`)}
              className="text-gray-600 hover:text-gray-900"
            >
              Accueil
            </button>
            <button
              onClick={() =>
                handleNavigate(`/shop/${shopId}/catalogue`)
              }
              className="text-gray-600 hover:text-gray-900"
            >
              Catalogue
            </button>
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={() =>
                handleNavigate(`/shop/${shopId}/apropos`)
              }
            >
              À propos
            </button>
            <button
              onClick={() =>
                handleNavigate(`/shop/${shopId}/contact`)
              }
              className="text-gray-600 hover:text-gray-900"
            >
              Contacts
            </button>
          </div>

          <button
            onClick={() =>
              handleNavigate(`/shop/${shopId}/panier`)
            }
            className="relative"
          >
            <div
              className="px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: effectiveColor }}
            >
              Panier (2)
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}
