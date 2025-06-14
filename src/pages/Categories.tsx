
import { useState } from "react";
import AppNavbar from "@/components/AppNavbar";
import { useProductCategories } from "@/hooks/useProductCategories";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { ProductCategory } from "@/hooks/useProductCategories";

const Categories = () => {
  const { categories, isLoading, error, addCategory, updateCategory, deleteCategory } = useProductCategories();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | undefined>();

  if (isLoading) {
    return (
      <div>
        <AppNavbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Kategori Produk</h1>
          <p>Memuat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <AppNavbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Kategori Produk</h1>
          <p className="text-red-500">Gagal memuat kategori</p>
        </div>
      </div>
    );
  }

  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
  };

  const handleSave = (categoryData: { key: string; label: string; icon: string; color: string }) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, categoryData);
    } else {
      // Include the required 'type' field for new categories
      addCategory({
        ...categoryData,
        type: 'product'
      });
    }
    setEditingCategory(undefined);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Kategori Produk</h1>
            <p className="text-gray-600">{categories.length} kategori tersedia</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kategori
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <CategoryForm
          category={editingCategory}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default Categories;
