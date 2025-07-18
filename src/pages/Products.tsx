import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import AppNavbar from "@/components/AppNavbar";
import { useProducts } from "@/hooks/useProducts";
import { useIngredients } from "@/hooks/useIngredients";
import { Product, TaskPriority } from "@/types";
import { calculateSellingPrice } from "@/lib/utils";
import { ProductList } from "@/components/products/ProductList";
import { ProductForm } from "@/components/products/ProductForm";
import { TaskDialog } from "@/components/products/TaskDialog";
import { LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/products/ProductTable";

const Products = () => {
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  const {
    products,
    isLoading,
    error,
    getProductWithDetails,
    createProduct,
    updateProduct,
    deleteProduct,
    addIngredient,
    removeIngredient,
  } = useProducts();

  const {
    ingredients,
  } = useIngredients();

  const { data: productWithDetails } = getProductWithDetails(selectedProduct?.id || "");

  const handleAddProduct = () => {
    setIsEditing(false);
    setSelectedProduct(null);
    setOpenProductDialog(true);
  };

  const handleSubmit = (values: any) => {
    // Calculate cost price from current ingredients if not editing
    let costPrice = 0;
    if (isEditing && selectedProduct) {
      costPrice = selectedProduct.costPrice;
    } else if (productWithDetails?.ingredients) {
      costPrice = productWithDetails.ingredients.reduce((sum, item) => {
        if (item.ingredient) {
          return sum + (item.quantity * item.ingredient.pricePerUnit);
        }
        return sum;
      }, 0);
    }

    const effectiveSellingPrice = calculateSellingPrice(costPrice, values.markupPercentage);
    
    if (isEditing && selectedProduct) {
      updateProduct({
        id: selectedProduct.id,
        name: values.name,
        description: values.description,
        categoryId: values.categoryId,
        costPrice: costPrice,
        sellingPrice: effectiveSellingPrice,
        stock: values.stock || 0,
        minOrder: values.minOrder || 1,
      });
    } else {
      createProduct({
        name: values.name,
        description: values.description,
        categoryId: values.categoryId,
        costPrice: costPrice,
        sellingPrice: effectiveSellingPrice,
        stock: values.stock || 0,
        minOrder: values.minOrder || 1,
      });
    }
    setOpenProductDialog(false);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setOpenProductDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  const handleAddIngredient = (values: any) => {
    if (selectedProduct) {
      console.log("Adding ingredient:", values);
      // Find the selected ingredient to get its unit price and tasks
      const selectedIngredient = ingredients.find(
        (i) => i.id === values.ingredientId
      );

      if (selectedIngredient) {
        // Add the ingredient to the product
        addIngredient({
          productId: selectedProduct.id,
          ingredientId: values.ingredientId,
          quantity: values.quantity,
        });
      }
    }
  };

  const handleRemoveIngredient = (id: string, productId: string) => {
    if (confirm("Are you sure you want to remove this ingredient?")) {
      removeIngredient({ id, productId });
    }
  };

  const handleViewTasks = (product: Product) => {
    setSelectedProduct(product);
    setOpenTaskDialog(true);
  };

  if (isLoading) {
    return (
      <div>
        <AppNavbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Products</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <AppNavbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-red-500">Error loading products</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header with View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <div className="flex gap-4">
            <div className="flex border rounded-md overflow-hidden">
              <Button 
                variant={viewMode === "grid" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setViewMode("grid")}
                className="rounded-none"
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                Grid
              </Button>
              <Button 
                variant={viewMode === "table" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setViewMode("table")}
                className="rounded-none"
              >
                <LayoutList className="h-4 w-4 mr-1" />
                Table
              </Button>
            </div>
            <Button onClick={handleAddProduct}>Add Product</Button>
          </div>
        </div>

        {/* Conditional Rendering of View Mode */}
        {viewMode === "grid" ? (
          <ProductList 
            products={products} 
            onAddNew={handleAddProduct} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewIngredients={() => {}} // No longer needed, but kept for interface compatibility
            onViewTasks={handleViewTasks}
          />
        ) : (
          <ProductTable
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewTasks={handleViewTasks}
          />
        )}

        {/* Product Form Dialog */}
        <Dialog open={openProductDialog} onOpenChange={setOpenProductDialog}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogTitle>
              {isEditing ? "Edit Product" : "Add Product"}
            </DialogTitle>
            <ProductForm
              isEditing={isEditing}
              selectedProduct={selectedProduct}
              productIngredients={productWithDetails?.ingredients || []}
              onSubmit={handleSubmit}
              onAddIngredient={handleAddIngredient}
              onRemoveIngredient={handleRemoveIngredient}
            />
          </DialogContent>
        </Dialog>

        {/* Display Task Dialog - read-only view of tasks from ingredients */}
        <Dialog open={openTaskDialog} onOpenChange={setOpenTaskDialog}>
          {selectedProduct && productWithDetails && (
            <TaskDialog
              product={selectedProduct}
              tasks={productWithDetails.tasks || []}
              readonly={true}
            />
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default Products;
