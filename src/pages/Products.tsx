
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
import { IntegratedProductForm } from "@/components/products/IntegratedProductForm";
import { TaskDialog } from "@/components/products/TaskDialog";

const Products = () => {
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
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
    const effectiveSellingPrice = calculateSellingPrice(
      isEditing && selectedProduct ? selectedProduct.costPrice : 0,
      values.markupPercentage
    );
    
    if (isEditing && selectedProduct) {
      updateProduct({
        id: selectedProduct.id,
        name: values.name,
        description: values.description,
        costPrice: selectedProduct.costPrice, // Keep the cost price from server
        sellingPrice: effectiveSellingPrice,
        stock: values.stock || 0,
        minOrder: values.minOrder || 1,
      });
    } else {
      createProduct({
        name: values.name,
        description: values.description,
        costPrice: 0, // Cost price will be calculated on the server
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
        {/* Product List */}
        <ProductList 
          products={products} 
          onAddNew={handleAddProduct} 
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewIngredients={() => {}} // No longer needed, but keep for interface compatibility
          onViewTasks={handleViewTasks}
        />

        {/* Integrated Product Form Dialog */}
        <Dialog open={openProductDialog} onOpenChange={setOpenProductDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogTitle>
              {isEditing ? "Edit Product" : "Add Product"}
            </DialogTitle>
            {selectedProduct || !isEditing ? (
              <IntegratedProductForm
                isEditing={isEditing}
                selectedProduct={selectedProduct}
                ingredients={ingredients}
                productIngredients={productWithDetails?.ingredients || []}
                onSubmit={handleSubmit}
                onAddIngredient={handleAddIngredient}
                onRemoveIngredient={handleRemoveIngredient}
              />
            ) : (
              <p>Loading product details...</p>
            )}
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
