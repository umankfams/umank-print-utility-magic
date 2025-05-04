
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";

interface ProductListProps {
  products: Product[];
  onAddNew: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onViewIngredients: (product: Product) => void; // Kept for backward compatibility
  onViewTasks: (product: Product) => void;
}

export const ProductList = ({
  products,
  onAddNew,
  onEdit,
  onDelete,
  onViewIngredients,
  onViewTasks,
}: ProductListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewIngredients={onViewIngredients}
          onViewTasks={onViewTasks}
        />
      ))}

      {products.length === 0 && (
        <div className="text-center py-10 col-span-full">
          <p className="text-muted-foreground">
            No products found. Click "Add Product" to create one.
          </p>
        </div>
      )}
    </div>
  );
};
