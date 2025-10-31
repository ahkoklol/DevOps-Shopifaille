// front/src/app/routes/admin/dashboard/ProductManagement.tsx
import { useState } from 'react';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from "../../../../shared/components/ui/Button";
import { Card } from '../../../../shared/components/ui/Card';
import { Input } from '../../../../shared/components/ui/Input';
import { Label } from '../../../../shared/components/ui/Label';
import { Textarea } from '../../../../shared/components/ui/TextArea';
import { Badge } from '../../../../shared/components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../shared/components/ui/Table';
import { 
  getProductsByShopId, 
  getCategoriesByShopId,
  type Product 
} from '../../../../shared/lib/mock-data';

interface ProductManagementProps {
  shopId: string;
}

export function ProductList({ shopId }: ProductManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const products = getProductsByShopId(shopId);

  if (showForm || editingProduct) {
    return (
      <ProductForm 
        shopId={shopId}
        product={editingProduct}
        onBack={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
      />
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Produits</h1>
          <p className="text-gray-600">Gérez votre catalogue de produits</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.price.toFixed(2)} €</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                    {product.status === 'active' ? 'Actif' : 'Brouillon'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

interface ProductFormProps {
  shopId: string;
  product?: Product | null;
  onBack: () => void;
}

function ProductForm({ shopId, product, onBack }: ProductFormProps) {
  const categories = getCategoriesByShopId(shopId);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || '',
    image: product?.image || '',
    categoryId: product?.categoryId || categories[0]?.id || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(product ? 'Produit mis à jour !' : 'Produit créé !');
    onBack();
  };

  return (
    <div className="p-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour à la liste
      </Button>

      <Card className="max-w-2xl p-8">
        <h2 className="text-2xl text-gray-900 mb-6">
          {product ? 'Modifier le produit' : 'Nouveau produit'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Nom du produit</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Robe d'été"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Décrivez votre produit..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Prix (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Catégorie</Label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="image">URL de l'image</Label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              placeholder="https://..."
              required
            />
            {formData.image && (
              <div className="mt-3 p-3 border rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Aperçu:</p>
                <img 
                  src={formData.image} 
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {product ? 'Mettre à jour' : 'Créer le produit'}
            </Button>
            <Button type="button" variant="outline" onClick={onBack}>
              Annuler
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
