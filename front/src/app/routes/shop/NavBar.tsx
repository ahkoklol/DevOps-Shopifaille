import { User, LogOut } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Outlet, useNavigate, useLocation, useParams } from "react-router-dom";
import datas from '../../../data/data.json';

interface NavbarProps {
  variant?: 'platform' | 'admin' | 'shop';
  shopName?: string;
  shopLogo?: string;
  primaryColor?: string;
  onNavigate?: (path: string) => void;
}

export function Navbar({
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const shopId = useParams();
  const foundShop = datas.shops.find(shop => shop.id === shopId.shopId);





  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <button
            onClick={() => navigate(`/shop/${shopId.shopId}`)}
            className="flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl"
              style={{ backgroundColor: foundShop?.codeColor || '#3B82F6' }}
            >
              {foundShop?.logo || '🛍️'}
            </div>
            <span className="text-gray-900">{foundShop?.name}</span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate(`/shop/${shopId.shopId}`)}
              className="text-gray-600 hover:text-gray-900"
            >
              Accueil
            </button>
            <button
              onClick={() => navigate(`/shop/${shopId.shopId}/catalogue`)}
              className="text-gray-600 hover:text-gray-900"
            >
              Catalogue
            </button>

            <button className="text-gray-600 hover:text-gray-900"
              onClick={() => navigate(`/shop/${shopId.shopId}/apropos`)}>
              À propos
            </button>
            <button
              onClick={() => navigate(`/shop/${shopId.shopId}/contact`)}
              className="text-gray-600 hover:text-gray-900"
            >
              Contacts
            </button>
          </div>

          <button
            onClick={() => navigate(`/shop/${shopId.shopId}/panier`)}

            className="relative"
          >
            <div
              className="px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: foundShop?.codeColor || '#3B82F6' }}
            >
              Panier (2)
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}


