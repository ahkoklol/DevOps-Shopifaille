//front/src/app/routes/admin/auth/AdminLoginPage.tsx
import { ArrowLeft, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../shared/components/ui/Button";
import { Input } from "../../../../shared/components/ui/Input";
import { Label } from "../../../../shared/components/ui/Label";
import { Card } from "../../../../shared/components/ui/Card";

/**
 * Page de connexion du back-office (accessible à /admin/login)
 */
export default function AdminLoginPage() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: vérification des identifiants
    navigate("/admin/home");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2 text-blue-600">
            <Store className="w-8 h-8" />
            <span className="text-2xl font-semibold">WayneShopifaille</span>
          </div>
        </div>

        <h1 className="text-2xl text-center text-gray-900 mb-2">Connexion</h1>
        <p className="text-center text-gray-600 mb-8">
          Accédez à votre espace administrateur
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="jean@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-gray-600">Se souvenir de moi</span>
            </label>
            <button
              type="button"
              onClick={() => navigate("/admin/forgot-password")}
              className="text-sm text-blue-600 hover:underline"
            >
              Mot de passe oublié ?
            </button>
          </div>

          <Button type="submit" className="w-full">
            Se connecter
          </Button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-600">Pas encore de compte ?</span>
          <button
                          type="button"

            onClick={() => navigate("/subscribe")}
            className="text-blue-600 hover:underline"
          >
            Créer un compte
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
