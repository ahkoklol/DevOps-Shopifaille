import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Button } from './../../../../shared/components/ui/Button';
import { Input } from './../../../../shared/components/ui/Input';
import { Label } from './../../../../shared/components/ui/Label';
import { Card } from './../../../../shared/components/ui/Card';
import { Progress } from './../../../../shared/components/ui/progress';
import { Navbar } from '../Navbar';
import { useNavigate } from "react-router-dom";

export function CreateShopPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [shopData, setShopData] = useState({
    name: '',
    domain: '',
    logo: '',
    primaryColor: '#3B82F6',
    template: 'modern'
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      navigate('/admin/platform/shop-created');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/admin/platform/dashboard');
    }
  };

  const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Étape {step} sur {totalSteps}</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="p-8">
            {step === 1 && (
              <div>
                <h2 className="text-2xl text-gray-900 mb-2">Donnez un nom à votre boutique</h2>
                <p className="text-gray-600 mb-6">Choisissez un nom accrocheur qui représente votre marque</p>

                <div>
                  <Label htmlFor="shop-name">Nom de la boutique</Label>
                  <Input
                    id="shop-name"
                    type="text"
                    placeholder="Ma Boutique Extraordinaire"
                    value={shopData.name}
                    onChange={(e) => setShopData({ ...shopData, name: e.target.value })}
                    className="text-lg"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl text-gray-900 mb-2">Choisissez votre domaine</h2>
                <p className="text-gray-600 mb-6">Votre boutique sera accessible à cette adresse</p>

                <div>
                  <Label htmlFor="domain">Domaine personnalisé</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="domain"
                      type="text"
                      placeholder="ma-boutique"
                      value={shopData.domain}
                      onChange={(e) => setShopData({ ...shopData, domain: e.target.value })}
                    />
                    <span className="text-gray-600 whitespace-nowrap">.waynestore.com</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Exemple: ma-boutique.waynestore.com
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl text-gray-900 mb-2">Ajoutez votre logo</h2>
                <p className="text-gray-600 mb-6">Un emoji ou une image pour représenter votre boutique</p>

                <div>
                  <Label htmlFor="logo">Logo (emoji ou URL d'image)</Label>
                  <Input
                    id="logo"
                    type="text"
                    placeholder="🛍️ ou https://..."
                    value={shopData.logo}
                    onChange={(e) => setShopData({ ...shopData, logo: e.target.value })}
                  />

                  {shopData.logo && (
                    <div className="mt-4 p-6 border rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-2">Aperçu:</p>
                      <div className="text-6xl">{shopData.logo}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-2xl text-gray-900 mb-2">Choisissez votre couleur principale</h2>
                <p className="text-gray-600 mb-6">Cette couleur sera utilisée pour les boutons et accents</p>

                <div className="grid grid-cols-6 gap-4">
                  {colors.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setShopData({ ...shopData, primaryColor: color })}
                      className="relative aspect-square rounded-lg border-2 transition-all hover:scale-110"
                      style={{
                        backgroundColor: color,
                        borderColor: shopData.primaryColor === color ? '#000' : 'transparent'
                      }}
                    >
                      {shopData.primaryColor === color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div
                  className="mt-6 p-4 border rounded-lg"
                  style={{ backgroundColor: `${shopData.primaryColor}10` }}
                >
                  <p className="text-sm text-gray-600 mb-2">Aperçu:</p>
                  <Button style={{ backgroundColor: shopData.primaryColor }}>
                    Exemple de bouton
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {step === 1 ? 'Annuler' : 'Précédent'}
              </Button>

              <Button onClick={handleNext}>
                {step === totalSteps ? 'Créer ma boutique' : 'Suivant'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function ShopCreatedPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useState(() => {
    setTimeout(() => setLoading(false), 2000);
  });

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="p-12 text-center max-w-md">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl text-gray-900 mb-2">Création en cours...</h2>
            <p className="text-gray-600">Votre boutique est en cours de configuration</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-3xl text-gray-900 mb-3">Félicitations ! 🎉</h2>
          <p className="text-gray-600 mb-8">
            Votre boutique est prête à être utilisée. Vous pouvez maintenant commencer à ajouter vos produits.
          </p>

          <div className="space-y-3">
            <Button className="w-full" onClick={() => navigate('/admin/home')}>
              Accéder au back-office
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/shop/shop-1')}>
              Voir ma boutique publique
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate('/admin/platform/dashboard')}>
              Retour au tableau de bord
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
