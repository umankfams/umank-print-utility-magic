import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import { useProducts } from "@/hooks/useProducts";
import { useIngredients } from "@/hooks/useIngredients";
import { Product } from "@/types";
import { calculateSellingPrice } from "@/lib/utils";
import { ProductList } from "@/components/products/ProductList";
import { ProductForm, ProductFormSubmitData } from "@/components/products/ProductForm";
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

  const handleSubmit = async (values: ProductFormSubmitData) => {
    const { localIngredients, ...productValues } = values;

    // Calculate cost from local ingredients
    const costPrice = localIngredients.reduce((sum, item) => {
      if (item.ingredient) {
        return sum + (item.quantity * item.ingredient.pricePerUnit);
      }
      return sum;
    }, 0);

    const effectiveSellingPrice = calculateSellingPrice(costPrice, productValues.markupPercentage);

    if (isEditing && selectedProduct) {
      updateProduct({
        id: selectedProduct.id,
        name: productValues.name,
        description: productValues.description,
        categoryId: productValues.categoryId,
        costPrice,
        sellingPrice: effectiveSellingPrice,
        stock: productValues.stock || 0,
        minOrder: productValues.minOrder || 1,
      });

      // Handle ingredient changes for editing:
      // Remove ingredients that were deleted locally
      const existingIds = (productWithDetails?.ingredients || []).map(i => i.id);
      const keptDbIds = localIngredients.filter(i => i.dbId).map(i => i.dbId!);
      const removedIds = existingIds.filter(id => !keptDbIds.includes(id));
      
      for (const id of removedIds) {
        removeIngredient({ id, productId: selectedProduct.id });
      }

      // Add new ingredients (those without dbId)
      const newIngredients = localIngredients.filter(i => !i.dbId);
      for (const item of newIngredients) {
        addIngredient({
          productId: selectedProduct.id,
          ingredientId: item.ingredientId,
          quantity: item.quantity,
        });
      }
    } else {
      // Create product first, then add ingredients
      createProduct({
        product: {
          name: productValues.name,
          description: productValues.description,
          categoryId: productValues.categoryId,
          costPrice,
          sellingPrice: effectiveSellingPrice,
          stock: productValues.stock || 0,
          minOrder: productValues.minOrder || 1,
        },
        ingredients: localIngredients.map(i => ({
          ingredientId: i.ingredientId,
          quantity: i.quantity,
        })),
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

  const handleViewTasks = (product: Product) => {
    setSelectedProduct(product);
    setOpenTaskDialog(true);
  };

  if (isLoading) {
    return (
      <div>

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

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-destructive">Error loading products</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">

      <div className="container mx-auto px-4 py-8">
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

        {viewMode === "grid" ? (
          <ProductList 
            products={products} 
            onAddNew={handleAddProduct} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewIngredients={() => {}}
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
            />
          </DialogContent>
        </Dialog>

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