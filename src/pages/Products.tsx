
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import AppNavbar from "@/components/AppNavbar";
import { useProducts } from "@/hooks/useProducts";
import { useIngredients } from "@/hooks/useIngredients";
import { Product, TaskPriority } from "@/types";
import { calculateSellingPrice } from "@/lib/utils";
import { ProductList } from "@/components/products/ProductList";
import { ProductForm } from "@/components/products/ProductForm";
import { IngredientDialog } from "@/components/products/IngredientDialog";
import { TaskDialog } from "@/components/products/TaskDialog";

const Products = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openIngredientDialog, setOpenIngredientDialog] = useState(false);
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
    createTaskTemplate,
    deleteTaskTemplate,
  } = useIngredients();

  const { data: productWithDetails } = getProductWithDetails(selectedProduct?.id || "");

  const handleAddProduct = () => {
    setIsEditing(false);
    setSelectedProduct(null);
    setOpenDialog(true);
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
    setOpenDialog(false);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  const handleViewIngredients = (product: Product) => {
    setSelectedProduct(product);
    setOpenIngredientDialog(true);
  };

  const handleAddIngredient = (values: any) => {
    if (selectedProduct) {
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
        
        // Check if the ingredient has associated tasks and inherit them
        if (selectedIngredient.tasks && selectedIngredient.tasks.length > 0) {
          // Create similar tasks for the product
          selectedIngredient.tasks.forEach(task => {
            createTaskTemplate({
              title: `${task.title} (from ${selectedIngredient.name})`,
              description: task.description,
              priority: task.priority as TaskPriority,
              isSubtask: task.isSubtask,
              parentTemplateId: task.parentTemplateId,
              ingredientId: task.ingredientId,
              productId: selectedProduct.id,
            });
          });
        }
      }
    }
    setOpenIngredientDialog(false);
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

  const handleAddTask = (values: any) => {
    if (selectedProduct) {
      createTaskTemplate({
        title: values.title,
        description: values.description,
        priority: values.priority as TaskPriority,
        isSubtask: values.isSubtask,
        parentTemplateId: values.parentTemplateId,
        ingredientId: undefined,
        productId: selectedProduct.id,
      });
    }
    setOpenTaskDialog(false);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskTemplate(taskId);
    }
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
          onViewIngredients={handleViewIngredients}
          onViewTasks={handleViewTasks}
        />

        {/* Add/Edit Product Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <ProductForm 
              isEditing={isEditing}
              selectedProduct={selectedProduct}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>

        {/* Ingredient Dialog */}
        <Dialog open={openIngredientDialog} onOpenChange={setOpenIngredientDialog}>
          {selectedProduct && productWithDetails && (
            <IngredientDialog
              product={selectedProduct}
              ingredients={ingredients}
              productIngredients={productWithDetails.ingredients || []}
              onAddIngredient={handleAddIngredient}
              onRemoveIngredient={handleRemoveIngredient}
            />
          )}
        </Dialog>

        {/* Task Dialog */}
        <Dialog open={openTaskDialog} onOpenChange={setOpenTaskDialog}>
          {selectedProduct && productWithDetails && (
            <TaskDialog
              product={selectedProduct}
              tasks={productWithDetails.tasks || []}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default Products;
