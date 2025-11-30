//front/src/app/routes/admin/dashboard/Settings.tsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Save, Store, CreditCard, Truck, Bell, Shield, Globe } from "lucide-react";

// UI components (paths adapted to your repo)
import { Button } from "../../../../shared/components/ui/Button";
import { Card } from "../../../../shared/components/ui/Card";
import { Input } from "../../../../shared/components/ui/Input";
import { Label } from "../../../../shared/components/ui/Label";
import { Textarea } from "../../../../shared/components/ui/TextArea";
import { Switch } from "../../../../shared/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../shared/components/ui/Tabs";

// Mock data (replace with real service later)
import { getShopById } from "../../../../shared/lib/mock-data";

interface SettingsProps {
  shopId?: string;
}

export function Settings({ shopId: propShopId }: SettingsProps) {
  // Read shopId from URL if not provided as a prop
  const params = useParams();
  const shopId = propShopId ?? (params as { shopId?: string })?.shopId ?? "";
  const shop = getShopById(shopId);

  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    // TODO: replace with a real mutation/API call
    alert("Paramètres sauvegardés !");
    setHasChanges(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Paramètres</h1>
          <p className="text-gray-600">Configurez les paramètres de votre boutique</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Enregistrer les modifications
          </Button>
        )}
      </div>

      <div className="max-w-5xl">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="general">
              <Store className="w-4 h-4 mr-2" />
              Général
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="w-4 h-4 mr-2" />
              Paiement
            </TabsTrigger>
            <TabsTrigger value="shipping">
              <Truck className="w-4 h-4 mr-2" />
              Livraison
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Sécurité
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-gray-900 mb-6">Informations de la boutique</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shopName">Nom de la boutique</Label>
                  <Input
                    id="shopName"
                    defaultValue={shop?.name}
                    onChange={() => setHasChanges(true)}
                  />
                </div>

                <div>
                  <Label htmlFor="shopDomain">Domaine</Label>
                  <Input
                    id="shopDomain"
                    defaultValue={shop?.domain}
                    onChange={() => setHasChanges(true)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Votre boutique sera accessible à cette adresse
                  </p>
                </div>

                <div>
                  <Label htmlFor="shopDescription">Description</Label>
                  <Textarea
                    id="shopDescription"
                    defaultValue={shop?.description}
                    rows={3}
                    onChange={() => setHasChanges(true)}
                  />
                </div>

                <div>
                  <Label htmlFor="shopEmail">Email de contact</Label>
                  <Input
                    id="shopEmail"
                    type="email"
                    placeholder="contact@votreboutique.com"
                    onChange={() => setHasChanges(true)}
                  />
                </div>

                <div>
                  <Label htmlFor="shopPhone">Téléphone</Label>
                  <Input
                    id="shopPhone"
                    type="tel"
                    placeholder="+33 1 23 45 67 89"
                    onChange={() => setHasChanges(true)}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-gray-900 mb-6">Adresse de l'entreprise</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    placeholder="123 Rue Example"
                    onChange={() => setHasChanges(true)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input id="city" placeholder="Paris" onChange={() => setHasChanges(true)} />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input
                      id="postalCode"
                      placeholder="75001"
                      onChange={() => setHasChanges(true)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">Pays</Label>
                  <select
                    id="country"
                    className="w-full px-3 py-2 border rounded-lg"
                    onChange={() => setHasChanges(true)}
                  >
                    <option>France</option>
                    <option>Belgique</option>
                    <option>Suisse</option>
                    <option>Canada</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="siret">SIRET / Numéro d'entreprise</Label>
                  <Input
                    id="siret"
                    placeholder="123 456 789 00012"
                    onChange={() => setHasChanges(true)}
                  />
                </div>

                <div>
                  <Label htmlFor="tva">Numéro TVA</Label>
                  <Input
                    id="tva"
                    placeholder="FR12345678901"
                    onChange={() => setHasChanges(true)}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-gray-900 mb-6">Préférences régionales</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <select
                    id="timezone"
                    className="w-full px-3 py-2 border rounded-lg"
                    onChange={() => setHasChanges(true)}
                  >
                    <option>Europe/Paris (GMT+1)</option>
                    <option>Europe/Brussels (GMT+1)</option>
                    <option>America/Montreal (GMT-5)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="currency">Devise</Label>
                  <select
                    id="currency"
                    className="w-full px-3 py-2 border rounded-lg"
                    onChange={() => setHasChanges(true)}
                  >
                    <option>EUR (€)</option>
                    <option>USD ($)</option>
                    <option>GBP (£)</option>
                    <option>CHF (CHF)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="language">Langue</Label>
                  <select
                    id="language"
                    className="w-full px-3 py-2 border rounded-lg"
                    onChange={() => setHasChanges(true)}
                  >
                    <option>Français</option>
                    <option>English</option>
                    <option>Español</option>
                    <option>Deutsch</option>
                  </select>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-gray-900 mb-6">Méthodes de paiement</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-gray-900">Carte bancaire</p>
                      <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
                    </div>
                  </div>
                  <Switch defaultChecked onChange={() => setHasChanges(true)} />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-gray-900">PayPal</p>
                      <p className="text-sm text-gray-500">Paiements via PayPal</p>
                    </div>
                  </div>
                  <Switch defaultChecked onChange={() => setHasChanges(true)} />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Store className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-gray-900">Virement bancaire</p>
                      <p className="text-sm text-gray-500">Paiement par virement</p>
                    </div>
                  </div>
                  <Switch onChange={() => setHasChanges(true)} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-gray-900 mb-6">Configuration Stripe</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stripePublic">Clé publique Stripe</Label>
                  <Input
                    id="stripePublic"
                    placeholder="pk_test_..."
                    onChange={() => setHasChanges(true)}
                  />
                </div>
                <div>
                  <Label htmlFor="stripeSecret">Clé secrète Stripe</Label>
                  <Input
                    id="stripeSecret"
                    type="password"
                    placeholder="sk_test_..."
                    onChange={() => setHasChanges(true)}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-gray-900 mb-6">Taxes</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Inclure les taxes dans les prix</p>
                    <p className="text-sm text-gray-500">Les prix affichés incluront la TVA</p>
                  </div>
                  <Switch defaultChecked onChange={() => setHasChanges(true)} />
                </div>

                <div>
                  <Label htmlFor="taxRate">Taux de TVA par défaut (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    defaultValue="20"
                    min="0"
                    max="100"
                    onChange={() => setHasChanges(true)}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Shipping Settings */}
          <TabsContent value="shipping" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-gray-900 mb-6">Zones de livraison</h3>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-gray-900">France métropolitaine</p>
                      <p className="text-sm text-gray-500">Livraison standard : 3-5 jours</p>
                    </div>
                    <Switch defaultChecked onChange={() => setHasChanges(true)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prix (€)</Label>
                      <Input
                        type="number"
                        defaultValue="5.90"
                        step="0.01"
                        onChange={() => setHasChanges(true)}
                      />
                    </div>
                    <div>
                      <Label>Gratuit à partir de (€)</Label>
                      <Input
                        type="number"
                        defaultValue="50"
                        onChange={() => setHasChanges(true)}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-gray-900">Europe</p>
                      <p className="text-sm text-gray-500">Livraison standard : 5-7 jours</p>
                    </div>
                    <Switch defaultChecked onChange={() => setHasChanges(true)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prix (€)</Label>
                      <Input
                        type="number"
                        defaultValue="12.90"
                        step="0.01"
                        onChange={() => setHasChanges(true)}
                      />
                    </div>
                    <div>
                      <Label>Gratuit à partir de (€)</Label>
                      <Input
                        type="number"
                        defaultValue="100"
                        onChange={() => setHasChanges(true)}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-gray-900">International</p>
                      <p className="text-sm text-gray-500">Livraison standard : 7-14 jours</p>
                    </div>
                    <Switch onChange={() => setHasChanges(true)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prix (€)</Label>
                      <Input
                        type="number"
                        defaultValue="24.90"
                        step="0.01"
                        onChange={() => setHasChanges(true)}
                      />
                    </div>
                    <div>
                      <Label>Gratuit à partir de (€)</Label>
                      <Input
                        type="number"
                        defaultValue="200"
                        onChange={() => setHasChanges(true)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-gray-900 mb-6">Options de livraison</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Retrait en magasin</p>
                    <p className="text-sm text-gray-500">Permettre aux clients de récupérer leur commande</p>
                  </div>
                  <Switch onChange={() => setHasChanges(true)} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Livraison express</p>
                    <p className="text-sm text-gray-500">Livraison en 24-48h</p>
                  </div>
                  <Switch onChange={() => setHasChanges(true)} />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-gray-900 mb-6">Notifications par email</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Nouvelle commande</p>
                    <p className="text-sm text-gray-500">Recevoir un email pour chaque nouvelle commande</p>
                  </div>
                  <Switch defaultChecked onChange={() => setHasChanges(true)} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Commande expédiée</p>
                    <p className="text-sm text-gray-500">Notification quand une commande est expédiée</p>
                  </div>
                  <Switch defaultChecked onChange={() => setHasChanges(true)} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Stock faible</p>
                    <p className="text-sm text-gray-500">Alerte quand un produit est en rupture de stock</p>
                  </div>
                  <Switch defaultChecked onChange={() => setHasChanges(true)} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Nouveau client</p>
                    <p className="text-sm text-gray-500">Notification pour chaque nouveau client</p>
                  </div>
                  <Switch onChange={() => setHasChanges(true)} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-gray-900 mb-6">Notifications clients</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Confirmation de commande</p>
                    <p className="text-sm text-gray-500">Email de confirmation après chaque achat</p>
                  </div>
                  <Switch defaultChecked onChange={() => setHasChanges(true)} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Suivi d'expédition</p>
                    <p className="text-sm text-gray-500">Email avec le numéro de suivi de colis</p>
                  </div>
                  <Switch defaultChecked onChange={() => setHasChanges(true)} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Newsletter</p>
                    <p className="text-sm text-gray-500">Envoyer des newsletters aux clients</p>
                  </div>
                  <Switch onChange={() => setHasChanges(true)} />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-gray-900 mb-6">Sécurité du compte</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    onChange={() => setHasChanges(true)}
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input id="newPassword" type="password" onChange={() => setHasChanges(true)} />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    onChange={() => setHasChanges(true)}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-gray-900 mb-6">Authentification à deux facteurs</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Activer 2FA</p>
                    <p className="text-sm text-gray-500">
                      Sécurité renforcée avec authentification à deux facteurs
                    </p>
                  </div>
                  <Switch onChange={() => setHasChanges(true)} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-gray-900 mb-6">Politique de confidentialité</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="privacyPolicy">Page de politique de confidentialité</Label>
                  <Textarea
                    id="privacyPolicy"
                    rows={6}
                    placeholder="Entrez votre politique de confidentialité..."
                    onChange={() => setHasChanges(true)}
                  />
                </div>

                <div>
                  <Label htmlFor="termsOfService">Conditions d'utilisation</Label>
                  <Textarea
                    id="termsOfService"
                    rows={6}
                    placeholder="Entrez vos conditions d'utilisation..."
                    onChange={() => setHasChanges(true)}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-red-200 bg-red-50">
              <h3 className="text-red-900 mb-4">Zone dangereuse</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-900">Supprimer la boutique</p>
                    <p className="text-sm text-red-700">
                      Cette action est irréversible. Toutes vos données seront perdues.
                    </p>
                  </div>
                  <Button variant="destructive">Supprimer</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
