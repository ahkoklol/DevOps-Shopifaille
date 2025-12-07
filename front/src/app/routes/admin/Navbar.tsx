import { Store, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/Button';

interface NavbarProps {
  variant?: 'platform' | 'admin' | 'shop';
  shopName?: string;
  shopLogo?: string;
  primaryColor?: string;
  onNavigate?: (path: string) => void;
}

export function Navbar({
  variant = 'platform',
  shopName,
  shopLogo,
  primaryColor,
}: NavbarProps) {
  const navigate = useNavigate();

  if (variant === 'shop') {
    return (
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              type="button"
              onClick={() => navigate(`/shop/${shopName}`)}
              className="flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl"
                style={{ backgroundColor: primaryColor || '#3B82F6' }}
              >
                {shopLogo || '🛍️'}
              </div>
              <span className="text-gray-900">{shopName}</span>
            </button>

            <div className="hidden md:flex items-center gap-8">
              <button
                type="button"
                onClick={() => navigate(`/shop/${shopName}`)}
                className="text-gray-600 hover:text-gray-900"
              >
                Accueil
              </button>
              <button
                type="button"
                onClick={() => navigate(`/shop/${shopName}/catalog`)}
                className="text-gray-600 hover:text-gray-900"
              >
                Catalogue
              </button>
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900"
              >
                À propos
              </button>
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900"
              >
                Contact
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/shop/${shopName}/cart`)}
              className="relative"
            >
              <div
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: primaryColor || '#3B82F6' }}
              >
                Panier (0)
              </div>
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // === ADMIN VARIANT ===
  if (variant === 'admin') {
    return (
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl"
                style={{ backgroundColor: primaryColor || '#3B82F6' }}
              >
                {shopLogo || '🛍️'}
              </div>
              <div>
                <div className="text-gray-900">{shopName}</div>
                <div className="text-xs text-gray-500">Administration</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profil
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/home')}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Quitter l'admin
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // === PLATFORM VARIANT ===
  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            type="button"
            onClick={() => navigate('/homepage')}
            className="flex items-center gap-2 text-blue-600"
          >
            <Store className="w-6 h-6" />
            <span className="text-xl">Shopifaille</span>
          </button>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/login')}>
              Connexion
            </Button>
            <Button onClick={() => navigate('/subscribe')}>
              Créer un compte
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
