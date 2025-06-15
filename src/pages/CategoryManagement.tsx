
import { useState } from "react";
import AppNavbar from "@/components/AppNavbar";
import { useCategories } from "@/hooks/useCategories";
import { CategoryManagementCard } from "@/components/categories/CategoryManagementCard";
import { CategoryManagementForm } from "@/components/categories/CategoryManagementForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Category } from "@/hooks/useCategories";

const CategoryManagement = () => {
  const { categories, isLoading, error, addCategory, updateCategory, deleteCategory } = useCategories();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  if (isLoading) {
    return (
      <div>
        <AppNavbar />
        <div className="min-h-screen bg-teal-500">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-white">Manajemen Kategori</h1>
            </div>
            <p className="text-white">Memuat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <AppNavbar />
        <div className="min-h-screen bg-teal-500">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-white">Manajemen Kategori</h1>
            </div>
            <p className="text-red-200">Gagal memuat kategori</p>
          </div>
        </div>
      </div>
    );
  }

  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const incomeCategories = categories.filter(cat => cat.type === 'income');

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
  };

  const handleSave = (categoryData: { key: string; label: string; icon: string; color: string; type: 'expense' | 'income' }) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, categoryData);
    } else {
      addCategory(categoryData);
    }
    setEditingCategory(undefined);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(undefined);
  };

  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <div className="min-h-screen bg-teal-500">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white">Manajemen Kategori</h1>
            <Button 
              onClick={handleAddCategory}
              className="bg-teal-600 hover:bg-teal-700 text-white border-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kategori
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-8">
            <button
              onClick={() => setActiveTab('expense')}
              className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${
                activeTab === 'expense'
                  ? 'bg-white text-teal-600 border-b-2 border-teal-600'
                  : 'bg-teal-400 text-white hover:bg-teal-300'
              }`}
            >
              Kategori Pengeluaran
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`px-6 py-3 rounded-t-lg font-medium transition-colors ml-2 ${
                activeTab === 'income'
                  ? 'bg-white text-teal-600 border-b-2 border-teal-600'
                  : 'bg-teal-400 text-white hover:bg-teal-300'
              }`}
            >
              Kategori Pemasukan
            </button>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'expense' ? expenseCategories : incomeCategories).map((category) => (
              <CategoryManagementCard
                key={category.id}
                category={category}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <CategoryManagementForm
            category={editingCategory}
            isOpen={isFormOpen}
            onClose={handleCloseForm}
            onSave={handleSave}
            defaultType={activeTab}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
