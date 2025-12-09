import { Store, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../shared/components/ui/Button";
import { Input } from "../../../../shared/components/ui/Input";
import { Label } from "../../../../shared/components/ui/Label";
import { Card } from "../../../../shared/components/ui/Card";

/**
 * Page d'inscription du back-office (accessible à /admin/register)
 */
export default function AdminRegisterPage() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/admin/home");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2 text-blue-600">
            <Store className="w-8 h-8" />
            <span className="text-2xl font-semibold">WayneShopifaille</span>
          </div>
        </div>

        <h1 className="text-2xl text-center text-gray-900 mb-2">
          Créer un compte
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Accédez à votre espace administrateur
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name">Nom complet</Label>
            <Input id="name" type="text" placeholder="Jean Dupont" required />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="jean@example.com" required />
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" placeholder="••••••••" required />
          </div>

          <div>
            <Label htmlFor="confirm">Confirmer le mot de passe</Label>
            <Input id="confirm" type="password" placeholder="••••••••" required />
          </div>

          <Button type="submit" className="w-full">
            Créer mon compte
          </Button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-600">Déjà un compte ? </span>
          <button
            type="button"
            onClick={() => navigate("/admin/login")}
            className="text-blue-600 hover:underline"
          >
            Se connecter
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l’accueil
        </button>
      </Card>
    </div>
  );
}
