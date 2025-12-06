//front/src/app/routes/admin/suscription/SuscriptionChoice.tsx
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../../shared/components/ui/Button";
import { Card } from "../../../../shared/components/ui/Card";

// Keep comments in English as requested.
// This page reuses the same visual system as AdminDashboardPage:
// - min-h-screen bg-gray-50
// - container: max-w-7xl, responsive paddings
// - Card and Button from shared UI

export default function SubscriptionChoice() {
  const navigate = useNavigate();

  const choosePlan = (plan: "trial" | "monthly" | "yearly") => {
    navigate(`/signup?plan=${plan}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M15 6L9 12L15 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Retour
          </button>
        </div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">
            Choisis ton abonnement
          </h1>
          <p className="text-gray-600">
            Sélectionne une offre pour créer ta boutique et démarrer rapidement.
          </p>
        </div>

        {/* Plans */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Free trial */}
          <Card className="p-6 flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl text-gray-900">Essai gratuit</h2>
              <p className="mt-1 text-sm text-gray-600">
                14 jours d’essai. Aucune carte requise.
              </p>
            </div>
            <ul className="text-sm text-gray-700 space-y-1 mb-6">
              <li>• Crée ta boutique</li>
              <li>• Teste thèmes et catalogue</li>
              <li>• Annule à tout moment</li>
            </ul>
            <Button
              size="lg"
              onClick={() => choosePlan("trial")}
              className="mt-auto"
            >
              Commencer l’essai
            </Button>
          </Card>

          {/* Monthly */}
          <Card className="p-6 relative flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl text-gray-900">1 mois</h2>
              <p className="mt-1 text-sm text-gray-600">
                Facturation mensuelle
              </p>
            </div>
            <div className="text-3xl text-gray-900 font-semibold mb-4">
              €29{" "}
              <span className="text-base font-medium text-gray-700">/mois</span>
            </div>
            <ul className="text-sm text-gray-700 space-y-1 mb-6">
              <li>• Tout l’essai + paiements</li>
              <li>• Domaines & SEO</li>
              <li>• Support standard</li>
            </ul>
            <Link to="/checkout?plan=monthly" className="mt-auto">
              <Button size="lg" className="w-full">Choisir 1 mois</Button>
            </Link>
          </Card>

          {/* Yearly (highlight) */}
          <Card className="p-6 relative ring-1 ring-blue-600/20 flex flex-col">
            <span className="absolute -top-3 right-4 inline-flex items-center rounded-md bg-blue-600 px-2 py-0.5 text-xs font-medium text-white shadow">
              Le plus populaire
            </span>
            <div className="mb-4">
              <h2 className="text-xl text-gray-900">1 an</h2>
              <p className="mt-1 text-sm text-gray-600">
                2 mois offerts équivalents
              </p>
            </div>
            <div className="text-3xl text-gray-900 font-semibold mb-4">
              €290{" "}
              <span className="text-base font-medium text-gray-700">/an</span>
            </div>
            <ul className="text-sm text-gray-700 space-y-1 mb-6">
              <li>• Support prioritaire</li>
              <li>• Remises marketplace</li>
              <li>• Outils d’export avancés</li>
            </ul>
            <Link to="/checkout?plan=yearly" className="mt-auto">
              <Button size="lg" className="w-full">Choisir 1 an</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
