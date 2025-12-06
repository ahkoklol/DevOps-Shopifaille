//front/src/app/routes/admin/auth/AdminForgotPasswordPage.tsx
import { ArrowLeft, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../shared/components/ui/Button";
import { Input } from "../../../../shared/components/ui/Input";
import { Label } from "../../../../shared/components/ui/Label";
import { Card } from "../../../../shared/components/ui/Card";

/**
 * Page de récupération du mot de passe (accessible à /admin/forgot-password)
 */
export default function AdminForgotPasswordPage() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Email de réinitialisation envoyé !");
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

        <h1 className="text-2xl text-center text-gray-900 mb-2">
          Mot de passe oublié
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Entrez votre email pour recevoir un lien de réinitialisation
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

          <Button type="submit" className="w-full">
            Envoyer le lien de réinitialisation
          </Button>
        </form>

        <button
          onClick={() => navigate("/admin/login")}
          className="mt-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </button>
      </Card>
    </div>
  );
}
