// front/src/app/routes/admin/dashboard/CategoryManagement.tsx
import { useState } from "react";
import { ArrowLeft, Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../../shared/components/ui/Button.tsx";
import { Card } from "../../../../shared/components/ui/Card.tsx";
import { Input } from "../../../../shared/components/ui/Input.tsx";
import { Label } from "../../../../shared/components/ui/Label.tsx";
import { Textarea } from "../../../../shared/components/ui/TextArea.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../shared/components/ui/Table.tsx";
import {
  type Category,
  getCategoriesByShopId,
  getProductsByShopId,
} from "../../../../shared/lib/mock-data.tsx";

interface CategoryManagementProps {
  shopId: string;
}

export function CategoryList({ shopId }: CategoryManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const categories = getCategoriesByShopId(shopId);
  const products = getProductsByShopId(shopId);

  if (showForm || editingCategory) {
    return (
      <CategoryForm
        _shopId={shopId}
        category={editingCategory}
        onBack={() => {
          setShowForm(false);
          setEditingCategory(null);
        }}
      />
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Catégories</h1>
          <p className="text-gray-600">Organisez vos produits par catégories</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle catégorie
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Nombre de produits</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => {
              const productCount = products.filter((p) =>
                p.categoryId === category.id
              ).length;

              return (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell className="text-gray-600">
                    {category.description}
                  </TableCell>
                  <TableCell>{productCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

interface CategoryFormProps {
  _shopId: string;
  category?: Category | null;
  onBack: () => void;
}

function CategoryForm({ _shopId, category, onBack }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(category ? "Catégorie mise à jour !" : "Catégorie créée !");
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
          {category ? "Modifier la catégorie" : "Nouvelle catégorie"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Nom de la catégorie</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Vêtements"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez cette catégorie..."
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {category ? "Mettre à jour" : "Créer la catégorie"}
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
