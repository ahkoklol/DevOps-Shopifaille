// src/app/routes/admin/suscription/CheckoutPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../../../shared/components/ui/Button";
import { Card } from "../../../../shared/components/ui/Card";

// Keep comments in English as requested.

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const query = useQuery();
  const plan = (query.get("plan") as "trial" | "monthly" | "yearly") ?? "monthly";

  // Plan metadata (displayed in summary)
  const planInfo = useMemo(() => {
    if (plan === "trial")
      return { title: "Essai gratuit — 14 jours", price: 0, frequency: "trial" };
    if (plan === "yearly") return { title: "1 an (2 mois offerts)", price: 290, frequency: "an" };
    return { title: "1 mois", price: 29, frequency: "mois" };
  }, [plan]);

  // Form state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      // After success, navigate to admin home (or adjust to your desired page)
      const t = setTimeout(() => navigate("/admin/home"), 1200);
      return () => clearTimeout(t);
    }
  }, [success, navigate]);

  // Minimal client-side validation (for demo only)
  const validate = () => {
    setError(null);

    if (plan !== "trial" && Number.isNaN(Number(planInfo.price))) {
      setError("Plan price invalid");
      return false;
    }
    if (!cardName.trim()) {
      setError("Le nom sur la carte est requis.");
      return false;
    }
    if (plan !== "trial") {
      if (!/^\d{12,19}$/.test(cardNumber.replace(/\s+/g, ""))) {
        setError("Numéro de carte invalide.");
        return false;
      }
      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        setError("Date d'expiration attendue au format MM/AA.");
        return false;
      }
      if (!/^\d{3,4}$/.test(cvc)) {
        setError("CVC invalide.");
        return false;
      }
    }
    return true;
  };

  const handlePay = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;

    setIsProcessing(true);
    setError(null);

    // Fake processing to appear realistic
    await new Promise((r) => setTimeout(r, 1200));

    // Fake failure example if card number starts with 4 (for demo) -> success otherwise
    const cleaned = cardNumber.replace(/\s+/g, "");
    if (cleaned && cleaned.startsWith("4")) {
      setIsProcessing(false);
      setError("La transaction a été refusée par la banque (simulation). Essaie une autre carte.");
      return;
    }

    setSuccess(true);
    setIsProcessing(false);
  };

  // Formatting helpers
  const formatCardNumber = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 19)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900 mb-1">Paiement</h1>
            <p className="text-gray-600 text-sm">Finalise ton abonnement — page de paiement factice (demo).</p>
          </div>

          {/* Back button */}
          <div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-gray-700 shadow-sm hover:bg-gray-50"
            >
              {/* simple chevron left */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Retour
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Payment form */}
          <Card className="p-6 lg:col-span-2">
            <form onSubmit={handlePay} className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Détails de paiement</h2>
                <p className="text-sm text-gray-600 mt-1">Informations de carte et facturation.</p>
              </div>

              {/* Card visual / summary row */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {/* fake card svg */}
                  <div className="w-36 h-20 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg text-white p-3 shadow">
                    <div className="text-xs opacity-80">Card</div>
                    <div className="mt-3 font-mono text-sm">{cardNumber ? formatCardNumber(cardNumber) : "•••• •••• •••• ••••"}</div>
                    <div className="mt-2 text-xs flex justify-between">
                      <span>{cardName || "Nom sur la carte"}</span>
                      <span>{expiry || "MM/AA"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-sm text-gray-700">
                  <div className="font-medium">{planInfo.title}</div>
                  <div className="text-sm text-gray-600">
                    {planInfo.price === 0 ? "Gratuit" : `Montant : €${planInfo.price} / ${planInfo.frequency}`}
                  </div>
                </div>
              </div>

              {/* Cardholder name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom (tel qu'il apparaît sur la carte)</label>
                <input
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Sarah Dupont"
                />
              </div>

              {/* Card number / expiry / cvc */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Numéro de carte</label>
                  <input
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="4242 4242 4242 4242"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">MM/AA</label>
                    <input
                      value={expiry}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                        const formatted = raw.length >= 3 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
                        setExpiry(formatted);
                      }}
                      placeholder="MM/AA"
                      className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">CVC</label>
                    <input
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="123"
                      inputMode="numeric"
                      className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Billing address */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Adresse de facturation (optionnelle)</label>
                <input
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="12 rue Exemple, 34000 Montpellier"
                  className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input id="saveCard" type="checkbox" checked={saveCard} onChange={() => setSaveCard((s) => !s)} />
                <label htmlFor="saveCard" className="text-sm text-gray-700">
                  Enregistrer cette carte pour les prochains paiements (simulation)
                </label>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}
              {success && <div className="text-sm text-green-600">Paiement réussi — redirection...</div>}

              <div className="flex items-center justify-between gap-4">
                <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="px-4 py-2">
                  Annuler
                </Button>

                <div className="flex-1 text-right">
                  <Button
                    type="submit"
                    disabled={isProcessing || plan === "trial"}
                    onClick={handlePay}
                    size="lg"
                    className="px-6 py-3"
                  >
                    {plan === "trial" ? "Commencer l’essai (gratuit)" : isProcessing ? "Traitement…" : `Payer €${planInfo.price}`}
                  </Button>
                </div>
              </div>

              {/* Small disclaimer */}
              <p className="text-xs text-gray-500">
                Ceci est une page de paiement factice pour la démonstration. Aucun paiement réel n'est effectué. Ne pas saisir de vraies informations bancaires.
              </p>
            </form>
          </Card>

          {/* Order summary */}
          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Récapitulatif</h3>
              <div className="text-sm text-gray-700 mb-4">
                <div className="flex justify-between">
                  <span>{planInfo.title}</span>
                  <span>{planInfo.price === 0 ? "€0" : `€${planInfo.price}`}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Frais</span>
                  <span>€0</span>
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-baseline">
                  <div>
                    <div className="text-sm text-gray-600">Total</div>
                    <div className="text-xs text-gray-500">TVA non incluse (simulation)</div>
                  </div>
                  <div className="text-xl font-semibold text-gray-900">{planInfo.price === 0 ? "€0" : `€${planInfo.price}`}</div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <div>Facturation : Carte de crédit</div>
                  <div className="mt-2">Contact : support@tonshop.example</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
