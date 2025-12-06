//front/src/app/routes/admin/HomePage.tsx
import { ArrowRight, Palette, Store, TrendingUp, Zap } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { useNavigate } from "react-router-dom";
import { Navbar } from "./Navbar";

function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: "Création rapide",
      description: "Créez votre boutique en moins de 5 minutes",
    },
    {
      icon: Palette,
      title: "Personnalisable",
      description: "Adaptez le design à votre marque",
    },
    {
      icon: TrendingUp,
      title: "Évolutif",
      description: "Faites grandir votre business facilement",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar variant="platform" onNavigate={() => {/* not used on home */}} />
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6">
            <Store className="w-4 h-4" />
            <span className="text-sm">
              Plateforme e-commerce nouvelle génération
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl text-gray-900 mb-6 max-w-4xl mx-auto">
            Créez votre boutique e-commerce en quelques clics
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Shopifaille vous permet de lancer votre boutique en ligne
            professionnelle sans aucune compétence technique. Simple, rapide et
            puissant.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate("/subscribe")}
              className="text-lg px-8 py-6"
            >
              Commencer gratuitement
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/admin/login")}
              className="text-lg px-8 py-6"
            >
              Se connecter
            </Button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-16 rounded-xl overflow-hidden shadow-2xl border">
          <img
            src="https://www.developperlestalents.fr/wp-content/uploads/2023/09/Ronron-1-864x467.png"
            alt="Shopifaille Dashboard"
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl text-center text-gray-900 mb-12">
          Tout ce dont vous avez besoin pour réussir
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl mb-4">Prêt à lancer votre boutique ?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Rejoignez des milliers de marchands qui font confiance à Shopifaille
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/subscribe")}
            className="text-lg px-8 py-6"
          >
            Créer ma boutique maintenant
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
