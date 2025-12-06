import { Clock, Heart, Mail, MapPin, Phone, Star, Timer } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Navbar } from "./NavBar";
import { useParams } from "react-router-dom";
import datas from "../../../data/data.json";

function Contact() {
  const { shopId: paramShopId } = useParams();
  const foundShop = datas.shops.find((shop) => shop.id === paramShopId);

  const features = [
    {
      icon: Timer,
      title: "Livraison rapide",
      description: "Expédition sous 24-48h",
    },
    {
      icon: Star,
      title: "Qualité garantie",
      description: "Produits de haute qualité",
    },
    { icon: Heart, title: "Service client", description: "Support 7j/7" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b">
      <Navbar variant="platform" onNavigate={() => {}} />
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 bg-purple-100">
        <div className="text-center">
          <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
            {/* Hero */}
            <section className="mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 bg-purple-100/60">
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-semibold text-gray-900">
                  {foundShop?.contact.title || "Contact"}
                </h1>
                {foundShop?.contact.subtitle && (
                  <p className="mt-3 text-gray-600">
                    {foundShop?.contact.subtitle}
                  </p>
                )}
              </div>
            </section>

            {/* Contenu */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
              {foundShop?.contact.description && (
                <p className="max-w-3xl mx-auto text-center text-gray-700 mb-10">
                  {foundShop?.contact.description}
                </p>
              )}

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {/* Téléphone */}
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-gray-100">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Téléphone</h3>
                      <p className="text-gray-600 mt-1">
                        {foundShop?.contact.phone || "Non renseigné"}
                      </p>
                      {foundShop?.contact.phone && (
                        <Button
                          className="mt-3"
                          asChild
                        >
                          <a
                            href={`tel:${
                              foundShop?.contact.phone.replace(/\s+/g, "")
                            }`}
                          >
                            Appeler
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Email */}
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-gray-100">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">E-mail</h3>
                      <p className="text-gray-600 mt-1">
                        {foundShop?.contact.email || "Non renseigné"}
                      </p>
                      {foundShop?.contact.email && (
                        <Button className="mt-3" asChild>
                          <a href={`mailto:${foundShop?.contact.email}`}>
                            Écrire un e-mail
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Adresse */}
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-gray-100">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Adresse</h3>
                      <p className="text-gray-600 mt-1">
                        {foundShop?.contact.address
                          ? `${foundShop?.contact.address.street}, ${foundShop?.contact.address.postalCode} ${foundShop?.contact.address.city}, ${foundShop?.contact.address.country}`
                          : "Non renseignée"}
                      </p>
                      {foundShop?.contact.address && (
                        <Button className="mt-3" asChild>
                          <a
                            target="_blank"
                            rel="noreferrer"
                            href={"https://www.google.com/maps/search/?api=1&query=" +
                              encodeURIComponent(
                                `${foundShop?.contact.address.street}, ${foundShop?.contact.address.postalCode} ${foundShop?.contact.address.city}, ${foundShop?.contact.address.country}`,
                              )}
                          >
                            Voir sur la carte
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Horaires + Réassurance */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-gray-100">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="w-full">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Horaires
                      </h3>
                      <ul className="text-gray-700 space-y-1">
                        <li>
                          <span className="font-medium">Lun–Ven :</span>{" "}
                          {foundShop?.contact.openingHours?.mondayToFriday ||
                            "—"}
                        </li>
                        <li>
                          <span className="font-medium">Samedi :</span>{" "}
                          {foundShop?.contact.openingHours?.saturday || "—"}
                        </li>
                        <li>
                          <span className="font-medium">Dimanche :</span>{" "}
                          {foundShop?.contact.openingHours?.sunday || "—"}
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Pourquoi nous faire confiance ?
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {features.map((f) => (
                      <div
                        key={f.title}
                        className="rounded-xl border p-4 text-center"
                      >
                        <f.icon className="w-5 h-5 mx-auto mb-2" />
                        <div className="text-sm font-medium">{f.title}</div>
                        <div className="text-xs text-gray-600">
                          {f.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </div>

      <div
        className="bg-pink text-white py-16"
        style={{ backgroundColor: foundShop?.codeColor || "#000000" }}
      >
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* <img src={logo} alt="Logo" className="w-10 h-10" /> */}
            <h2 className="text-3xl font-semibold">Tech & Gadgets</h2>
          </div>

          <p className="mt-8 text-sm">
            © 2025 Boutique Tech & Gadgets. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
