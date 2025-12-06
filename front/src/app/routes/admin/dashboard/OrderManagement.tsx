// front/src/app/routes/admin/dashboard/OrderManagement.tsx
import { useMemo, useState } from "react";
import {
  CheckCircle,
  Clock,
  Eye,
  Package,
  Search,
  Truck,
  XCircle,
} from "lucide-react";

// ⚠️ Adapte ces imports à TA structure.
// Si tes composants shadcn sont en minuscule (button, card, input, badge, tabs, table) conserve ceci :
import { Button } from "../../../../shared/components/ui/Button";
import { Card } from "../../../../shared/components/ui/Card";
import { Input } from "../../../../shared/components/ui/Input";
import { Badge } from "../../../../shared/components/ui/Badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../shared/components/ui/Tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../shared/components/ui/Table";

// Si dans ton repo ils sont en PascalCase (Button/Card/...), change simplement les chemins/noms d'import.
// Ex: "../../../../shared/components/ui/Button" etc.

import {
  getOrdersByShopId,
  type Order,
} from "../../../../shared/lib/mock-data";

// Keep comments in English as requested.

interface OrderManagementProps {
  shopId: string;
}

const statusConfig = {
  pending: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  processing: {
    label: "En traitement",
    color: "bg-blue-100 text-blue-800",
    icon: Package,
  },
  shipped: {
    label: "Expédiée",
    color: "bg-purple-100 text-purple-800",
    icon: Truck,
  },
  delivered: {
    label: "Livrée",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Annulée",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
} as const;

const paymentStatusConfig = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Payée", color: "bg-green-100 text-green-800" },
  failed: { label: "Échouée", color: "bg-red-100 text-red-800" },
  refunded: { label: "Remboursée", color: "bg-gray-100 text-gray-800" },
} as const;

type StatusKey = keyof typeof statusConfig;
type PayStatusKey = keyof typeof paymentStatusConfig;

export function OrderManagement({ shopId }: OrderManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Safe source (avoid undefined)
  const rawOrders = useMemo(() => getOrdersByShopId(shopId) ?? [], [shopId]);

  // Normalize to ensure items/status/paymentStatus exist
  const orders = useMemo(
    () =>
      rawOrders.map((o: any) => {
        const s: StatusKey =
          (o?.status in statusConfig ? o.status : "pending") as StatusKey;
        const p: PayStatusKey = (o?.paymentStatus in paymentStatusConfig
          ? o.paymentStatus
          : "pending") as PayStatusKey;
        return {
          ...o,
          id: o?.id ?? "N/A",
          date: o?.date ?? new Date().toISOString(),
          customerName: o?.customerName ?? "Client",
          customerEmail: o?.customerEmail ?? "",
          status: s,
          paymentStatus: p,
          items: Array.isArray(o?.items) ? o.items : [],
          subtotal: Number.isFinite(o?.subtotal) ? o.subtotal : 0,
          shipping: Number.isFinite(o?.shipping) ? o.shipping : 0,
          tax: Number.isFinite(o?.tax) ? o.tax : 0,
          total: Number.isFinite(o?.total) ? o.total : 0,
          shippingAddress: o?.shippingAddress ??
            { address: "", postalCode: "", city: "", country: "" },
        } as Order;
      }),
    [rawOrders],
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = order.id.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerEmail.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" ||
        order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) => o.status === "processing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      revenue: orders.reduce(
        (sum, o) => sum + (Number.isFinite(o.total) ? o.total : 0),
        0,
      ),
    }),
    [orders],
  );

  if (selectedOrder) {
    return (
      <OrderDetail
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
      />
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Commandes</h1>
          <p className="text-gray-600">Suivez et gérez toutes vos commandes</p>
        </div>
      </div>

      {/* Stats Cards — 1 seule ligne, taille fixe, scroll si trop étroit */}
      <div className="mb-8 overflow-x-auto">
        <div className="grid grid-flow-col auto-cols-[240px] gap-4">
          <Card className="p-6 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl text-gray-900">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En cours</p>
                <p className="text-2xl text-gray-900">{stats.processing}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Expédiées</p>
                <p className="text-2xl text-gray-900">{stats.shipped}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Livrées</p>
                <p className="text-2xl text-gray-900">{stats.delivered}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Rechercher par numéro de commande, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Orders Table with Tabs */}
      <Card>
        <Tabs
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="w-full"
        >
          <div className="border-b px-6 pt-4">
            <TabsList className="bg-transparent">
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="pending">En attente</TabsTrigger>
              <TabsTrigger value="processing">En cours</TabsTrigger>
              <TabsTrigger value="shipped">Expédiées</TabsTrigger>
              <TabsTrigger value="delivered">Livrées</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={statusFilter} className="m-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Produits</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0
                  ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-gray-500"
                      >
                        Aucune commande trouvée
                      </TableCell>
                    </TableRow>
                  )
                  : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="text-gray-900">
                          {order.id}
                        </TableCell>
                        <TableCell>
                          {new Date(order.date).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-gray-900">
                              {order.customerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customerEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {order.items?.length ?? 0} article(s)
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${
                                statusConfig[order.status as StatusKey].color
                              }`}
                            >
                              {statusConfig[order.status as StatusKey].label}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${
                              paymentStatusConfig[
                                order.paymentStatus as PayStatusKey
                              ].color
                            }`}
                          >
                            {paymentStatusConfig[
                              order.paymentStatus as PayStatusKey
                            ].label}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {order.total.toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function OrderDetail({ order, onBack }: { order: Order; onBack: () => void }) {
  const StatusIcon =
    statusConfig[(order.status as StatusKey) ?? "pending"].icon;

  return (
    <div className="p-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        ← Retour aux commandes
      </Button>

      <div className="max-w-5xl">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl text-gray-900">Commande {order.id}</h1>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-md ${
                  statusConfig[(order.status as StatusKey) ?? "pending"].color
                }`}
              >
                <StatusIcon className="w-4 h-4" />
                {statusConfig[(order.status as StatusKey) ?? "pending"].label}
              </div>
            </div>
            <p className="text-gray-600">
              Passée le {new Date(order.date).toLocaleDateString("fr-FR")} à
              {" "}
              {new Date(order.date).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Imprimer</Button>
            <Button>Modifier le statut</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Customer Info */}
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Client</h3>
            <div className="space-y-2">
              <p className="text-gray-900">{order.customerName}</p>
              <p className="text-sm text-gray-600">{order.customerEmail}</p>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Adresse de livraison</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.postalCode}{" "}
                {order.shippingAddress?.city}
              </p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </Card>

          {/* Payment & Tracking */}
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Paiement & Suivi</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Statut paiement</p>
                <div
                  className={`inline-flex px-2 py-1 rounded-md ${
                    paymentStatusConfig[
                      (order.paymentStatus as PayStatusKey) ?? "pending"
                    ].color
                  }`}
                >
                  {paymentStatusConfig[
                    (order.paymentStatus as PayStatusKey) ?? "pending"
                  ].label}
                </div>
              </div>
              {order.trackingNumber && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">N° de suivi</p>
                  <p className="text-gray-900">{order.trackingNumber}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="p-6 mb-8">
          <h3 className="text-gray-900 mb-4">Articles commandés</h3>
          <div className="space-y-4">
            {(order.items ?? []).map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 pb-4 border-b last:border-b-0"
              >
                <img
                  src={item.image || "https://via.placeholder.com/80"}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-600">
                    Quantité : {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-900">
                    {(item.price * item.quantity).toFixed(2)} €
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.price.toFixed(2)} € / unité
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Order Summary */}
        <Card className="p-6 max-w-md ml-auto">
          <h3 className="text-gray-900 mb-4">Résumé de la commande</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{(order.subtotal ?? 0).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Frais de livraison</span>
              <span>
                {order.shipping > 0
                  ? `${order.shipping.toFixed(2)} €`
                  : "Gratuit"}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>TVA (20%)</span>
              <span>{(order.tax ?? 0).toFixed(2)} €</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-gray-900">
              <span>Total</span>
              <span>
                {(Number.isFinite(order.total) ? order.total : 0).toFixed(2)} €
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
