// front/src/app/routes/admin/dashboard/CustomerManagement.tsx

import { useState } from "react";
import { UserPlus, Search, Mail, Phone, MapPin, ShoppingBag, Euro } from "lucide-react";

// ⚠️ Adapt these imports to YOUR repo structure (shared shadcn components in PascalCase).
import { Button } from "../../../../shared/components/ui/Button";
import { Card } from "../../../../shared/components/ui/Card";
import { Input } from "../../../../shared/components/ui/Input";
import { Badge } from "../../../../shared/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../shared/components/ui/Table";

import { getCustomersByShopId, type Customer } from "../../../../shared/lib/mock-data";

interface CustomerManagementProps {
  shopId: string;
}

function CustomerDetail({ customer, onBack }: { customer: Customer; onBack: () => void }) {
  return (
    <div className="p-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        ← Retour à la liste
      </Button>

      <div className="max-w-4xl">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-gray-600">
              Client depuis le {new Date(customer.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Modifier</Button>
            <Button>Contacter</Button>
          </div>
        </div>

        {/* Contact & address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Informations de contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5" />
                <span>{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span>{customer.phone}</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Adresse</h3>
            <div className="flex items-start gap-3 text-gray-600">
              <MapPin className="w-5 h-5 mt-1" />
              <div>
                <div>{customer.address}</div>
                <div>
                  {customer.postalCode} {customer.city}
                </div>
                <div>{customer.country}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Total des commandes</p>
            <p className="text-3xl text-gray-900">{customer.totalOrders}</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Total dépensé</p>
            <p className="text-3xl text-gray-900">{customer.totalSpent.toFixed(2)} €</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Panier moyen</p>
            <p className="text-3xl text-gray-900">
              {customer.totalOrders > 0
                ? (customer.totalSpent / customer.totalOrders).toFixed(2)
                : "0.00"}{" "}
              €
            </p>
          </Card>
        </div>

        {/* Order history placeholder */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Historique des commandes</h3>
          <p className="text-gray-500 text-sm">Les commandes de ce client apparaîtront ici</p>
        </Card>
      </div>
    </div>
  );
}

export default function CustomerManagement({ shopId }: CustomerManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // NOTE: Replace with API call later if needed.
  const customers = getCustomersByShopId(shopId);

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.firstName.toLowerCase().includes(searchLower) ||
      customer.lastName.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower)
    );
  });

  if (selectedCustomer) {
    return <CustomerDetail customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Clients</h1>
          <p className="text-gray-600">Gérez vos clients et leur historique d'achats</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Ajouter un client
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total clients</p>
              <p className="text-2xl text-gray-900">{customers.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Commandes totales</p>
              <p className="text-2xl text-gray-900">
                {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Euro className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Revenus totaux</p>
              <p className="text-2xl text-gray-900">
                {customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)} €
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Euro className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Panier moyen</p>
              <p className="text-2xl text-gray-900">
                {customers.length > 0
                  ? (
                      customers.reduce((sum, c) => sum + c.totalSpent, 0) /
                      customers.reduce((sum, c) => sum + c.totalOrders, 0)
                    ).toFixed(2)
                  : "0.00"}{" "}
                €
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Rechercher un client par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Customers table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead className="text-right">Commandes</TableHead>
              <TableHead className="text-right">Total dépensé</TableHead>
              <TableHead>Dernière commande</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div>
                    <div className="text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {customer.phone && (
                      <>
                        <Phone className="w-4 h-4" />
                        {customer.phone}
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {customer.city}, {customer.country}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{customer.totalOrders}</Badge>
                </TableCell>
                <TableCell className="text-right">{customer.totalSpent.toFixed(2)} €</TableCell>
                <TableCell>
                  {customer.lastOrderDate
                    ? new Date(customer.lastOrderDate).toLocaleDateString("fr-FR")
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(customer)}>
                    Voir détails
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
