import { Heart, Award, Users, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Navbar } from "./NavBar";
import { useNavigate, useParams } from "react-router-dom";
import datas from '../../../data/data.json';

function APropos() {
  const navigate = useNavigate();
  const { shopId } = useParams<{ shopId: string }>();
  const foundShop = datas.shops.find((s: any) => s.id === shopId);

  if (!foundShop) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl text-gray-900 mb-4">Page non disponible</h1>
          <p className="text-gray-600">Les informations "À propos" ne sont pas encore configurées.</p>
        </div>
      </div>
    );
  }

  const { about } = foundShop; 
  const brandColor = foundShop.codeColor ?? '#3B82F6';

  return (
    <div className="min-h-screen bg-gradient-to-b">
      <Navbar variant="platform" onNavigate={() => {}} />

      <div className="min-h-screen bg-white">
        {/* Hero */}
        <div
          className="relative text-white py-20 mb-12"
          style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)` }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-6xl mb-6">{foundShop.logo}</div>
            <h1 className="text-5xl mb-6">À propos de {foundShop.name}</h1>
            <p className="text-xl max-w-3xl mx-auto opacity-95">{foundShop.description}</p>
          </div>
        </div>

        {/* Histoire */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl text-gray-900 mb-6">Notre Histoire</h2>
              <div className="prose prose-lg text-gray-600">
                <p className="mb-4">{about?.story}</p>
                
              </div>
            </div>
            <div className="relative">
              <img
                src={about.image }
                alt="Notre histoire"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl text-gray-900 mb-6">Notre Mission</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">{about?.mission}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(about?.values ?? []).map((value: string, index: number) => {
                const icons = [Heart, Award, Users];
                const Icon = icons[index % icons.length];
                return (
                  <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                      style={{ backgroundColor: `${brandColor}20` }}
                    >
                      <Icon className="w-8 h-8" style={{ color: brandColor }} />
                    </div>
                    <h3 className="text-xl text-gray-900 mb-3">{value}</h3>
                    <p className="text-gray-600">
                      {index === 0 && "Nous sélectionnons uniquement les meilleurs produits pour garantir votre satisfaction."}
                      {index === 1 && "Nous restons à l'affût des dernières tendances pour vous offrir des produits innovants."}
                      {index === 2 && "Votre satisfaction est notre priorité absolue. Notre équipe est toujours à votre écoute."}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Équipe */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-gray-900 mb-6">Notre Équipe</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Rencontrez les personnes passionnées qui font vivre {foundShop.name} au quotidien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(about?.team ?? []).map((member: any, index: number) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-sm mb-4" style={{ color: brandColor }}>
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Réseaux sociaux (si présents) */}
        {about?.socialMedia && (
          <div className="bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl text-gray-900 mb-6">Suivez-nous</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Nous sommes là pour répondre à toutes vos questions. N'hésitez pas à nous contacter !
                </p>
              </div>

              <div className="flex items-center justify-center gap-4">
                {about.socialMedia.facebook && (
                  <a
                    href={about.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `${brandColor}20` }}
                  >
                    <Facebook className="w-5 h-5" style={{ color: brandColor }} />
                  </a>
                )}
                {about.socialMedia.instagram && (
                  <a
                    href={about.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `${brandColor}20` }}
                  >
                    <Instagram className="w-5 h-5" style={{ color: brandColor }} />
                  </a>
                )}
                {about.socialMedia.twitter && (
                  <a
                    href={about.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `${brandColor}20` }}
                  >
                    <Twitter className="w-5 h-5" style={{ color: brandColor }} />
                  </a>
                )}
                {about.socialMedia.linkedin && (
                  <a
                    href={about.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `${brandColor}20` }}
                  >
                    <Linkedin className="w-5 h-5" style={{ color: brandColor }} />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div
          className="py-20 text-white text-center"
          style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)` }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl mb-6">Prêt à découvrir nos produits ?</h2>
            <p className="text-xl mb-8 opacity-95">
              Explorez notre catalogue et trouvez les produits qui vous correspondent.
            </p>
            <Button
              size="lg"
              className="bg-white hover:bg-gray-100"
              style={{ color: brandColor }}
              onClick={() => navigate(`/shop/${shopId}/catalogue`)}
            >
              Voir le catalogue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default APropos;
