
import AppNavbar from "@/components/AppNavbar";
import { useProductCategories } from "@/hooks/useProductCategories";
import { CategoryCard } from "@/components/categories/CategoryCard";

const Categories = () => {
  const { categories, isLoading, error } = useProductCategories();

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

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kategori Produk</h1>
          <p className="text-gray-600">{categories.length} kategori tersedia</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
