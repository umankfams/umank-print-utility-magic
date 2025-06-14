import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product, ProductIngredient, TaskTemplate, TaskPriority } from "@/types";
import { toast } from "@/hooks/use-toast";

export function useProducts() {
  const queryClient = useQueryClient();

  const fetchProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching products:", error);
      throw new Error(error.message);
    }

    // Convert database rows to Product type
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      costPrice: Number(item.cost_price),
      sellingPrice: Number(item.selling_price),
      stock: Number(item.stock),
      minOrder: Number(item.min_order),
      categoryId: item.category_id,
      branchId: item.branch_id,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
  };

  const fetchProductWithDetails = async (id: string): Promise<Product> => {
    // Fetch product
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (productError) {
      console.error("Error fetching product:", productError);
      throw new Error(productError.message);
    }

    // Fetch product ingredients with ingredient details
    const { data: ingredientsData, error: ingredientsError } = await supabase
      .from("product_ingredients")
      .select(`
        id,
        product_id,
        ingredient_id,
        quantity,
        created_at,
        updated_at,
        ingredients:ingredient_id (
          id,
          name,
          description,
          stock,
          price_per_unit,
          unit
        )
      `)
      .eq("product_id", id);

    if (ingredientsError) {
      console.error("Error fetching product ingredients:", ingredientsError);
      throw new Error(ingredientsError.message);
    }

    // Fetch associated product tasks
    const { data: productTaskData, error: productTaskError } = await supabase
      .from("task_templates")
      .select("*")
      .eq("product_id", id);

    if (productTaskError) {
      console.error("Error fetching product tasks:", productTaskError);
      throw new Error(productTaskError.message);
    }

    // Fetch ingredient task templates for all ingredients in this product
    const ingredientIds = ingredientsData.map(item => item.ingredient_id);
    let ingredientTasks: any[] = [];
    
    if (ingredientIds.length > 0) {
      const { data: ingredientTaskData, error: ingredientTaskError } = await supabase
        .from("task_templates")
        .select("*")
        .in("ingredient_id", ingredientIds);

      if (ingredientTaskError) {
        console.error("Error fetching ingredient tasks:", ingredientTaskError);
        throw new Error(ingredientTaskError.message);
      }

      ingredientTasks = ingredientTaskData || [];
    }

    // Convert ingredients data
    const ingredients: ProductIngredient[] = ingredientsData.map(item => ({
      id: item.id,
      productId: item.product_id,
      ingredientId: item.ingredient_id,
      quantity: Number(item.quantity),
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      ingredient: item.ingredients ? {
        id: item.ingredients.id,
        name: item.ingredients.name,
        description: item.ingredients.description,
        stock: Number(item.ingredients.stock),
        pricePerUnit: Number(item.ingredients.price_per_unit),
        unit: item.ingredients.unit,
        createdAt: new Date(), // Not available in join
        updatedAt: new Date()  // Not available in join
      } : undefined
    }));

    // Convert task data - combining product tasks and ingredient tasks
    const allTaskTemplates = [...productTaskData, ...ingredientTasks];
    const tasks: TaskTemplate[] = allTaskTemplates.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority as TaskPriority | undefined,
      ingredientId: task.ingredient_id,
      productId: task.product_id,
      isSubtask: task.is_subtask || false,
      parentTemplateId: task.parent_template_id,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at)
    }));

    // Return product with details
    return {
      id: productData.id,
      name: productData.name,
      description: productData.description,
      costPrice: Number(productData.cost_price),
      sellingPrice: Number(productData.selling_price),
      stock: Number(productData.stock),
      minOrder: Number(productData.min_order),
      categoryId: productData.category_id,
      branchId: productData.branch_id,
      createdAt: new Date(productData.created_at),
      updatedAt: new Date(productData.updated_at),
      ingredients,
      tasks
    };
  };

  const createProduct = async (product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> => {
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: product.name,
        description: product.description,
        cost_price: product.costPrice,
        selling_price: product.sellingPrice,
        stock: product.stock,
        min_order: product.minOrder,
        category_id: product.categoryId,
        branch_id: product.branchId
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      costPrice: Number(data.cost_price),
      sellingPrice: Number(data.selling_price),
      stock: Number(data.stock),
      minOrder: Number(data.min_order),
      categoryId: data.category_id,
      branchId: data.branch_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  };

  const updateProduct = async (product: Partial<Product> & { id: string }): Promise<Product> => {
    const { data, error } = await supabase
      .from("products")
      .update({
        name: product.name,
        description: product.description,
        cost_price: product.costPrice,
        selling_price: product.sellingPrice,
        stock: product.stock,
        min_order: product.minOrder,
        category_id: product.categoryId,
        branch_id: product.branchId,
        updated_at: new Date().toISOString()
      })
      .eq("id", product.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      costPrice: Number(data.cost_price),
      sellingPrice: Number(data.selling_price),
      stock: Number(data.stock),
      minOrder: Number(data.min_order),
      categoryId: data.category_id,
      branchId: data.branch_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  };

  const deleteProduct = async (id: string): Promise<void> => {
    // First check if this product is used in any order
    const { data: orderData, error: orderError } = await supabase
      .from("order_items")
      .select("id")
      .eq("product_id", id);

    if (orderError) {
      console.error("Error checking order items:", orderError);
      throw new Error(orderError.message);
    }

    if (orderData && orderData.length > 0) {
      throw new Error("This product is used in orders and cannot be deleted");
    }

    // Delete associated task templates
    const { error: taskError } = await supabase
      .from("task_templates")
      .delete()
      .eq("product_id", id);

    if (taskError) {
      console.error("Error deleting task templates:", taskError);
      throw new Error(taskError.message);
    }

    // Delete product ingredients
    const { error: ingredientError } = await supabase
      .from("product_ingredients")
      .delete()
      .eq("product_id", id);

    if (ingredientError) {
      console.error("Error deleting product ingredients:", ingredientError);
      throw new Error(ingredientError.message);
    }

    // Then delete the product
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      throw new Error(error.message);
    }
  };

  const addIngredientToProduct = async (ingredient: Omit<ProductIngredient, "id" | "createdAt" | "updatedAt">): Promise<ProductIngredient> => {
    const { data, error } = await supabase
      .from("product_ingredients")
      .insert({
        product_id: ingredient.productId,
        ingredient_id: ingredient.ingredientId,
        quantity: ingredient.quantity
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding ingredient to product:", error);
      throw new Error(error.message);
    }

    // Update the product cost price
    await updateProductCostPrice(ingredient.productId);

    return {
      id: data.id,
      productId: data.product_id,
      ingredientId: data.ingredient_id,
      quantity: Number(data.quantity),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  };

  const updateProductIngredient = async (ingredient: Partial<ProductIngredient> & { id: string }): Promise<ProductIngredient> => {
    const { data, error } = await supabase
      .from("product_ingredients")
      .update({
        quantity: ingredient.quantity,
        updated_at: new Date().toISOString()
      })
      .eq("id", ingredient.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product ingredient:", error);
      throw new Error(error.message);
    }

    // Update the product cost price
    await updateProductCostPrice(data.product_id);

    return {
      id: data.id,
      productId: data.product_id,
      ingredientId: data.ingredient_id,
      quantity: Number(data.quantity),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  };

  const removeIngredientFromProduct = async (id: string, productId: string): Promise<void> => {
    const { error } = await supabase
      .from("product_ingredients")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error removing ingredient from product:", error);
      throw new Error(error.message);
    }

    // Update the product cost price
    await updateProductCostPrice(productId);
  };

  // Helper function to calculate and update a product's cost price based on its ingredients
  const updateProductCostPrice = async (productId: string): Promise<void> => {
    // Get all ingredients for this product
    const { data: ingredients, error: ingredientsError } = await supabase
      .from("product_ingredients")
      .select(`
        quantity,
        ingredients:ingredient_id (price_per_unit)
      `)
      .eq("product_id", productId);

    if (ingredientsError) {
      console.error("Error fetching product ingredients for cost calculation:", ingredientsError);
      throw new Error(ingredientsError.message);
    }

    // Calculate total cost
    const totalCost = ingredients.reduce((sum, item) => {
      if (!item.ingredients) return sum;
      return sum + (Number(item.quantity) * Number(item.ingredients.price_per_unit));
    }, 0);

    // Update product cost price
    const { error: updateError } = await supabase
      .from("products")
      .update({
        cost_price: totalCost,
        updated_at: new Date().toISOString()
      })
      .eq("id", productId);

    if (updateError) {
      console.error("Error updating product cost price:", updateError);
      throw new Error(updateError.message);
    }
  };

  // Define queries and mutations
  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts
  });

  const productDetailQuery = (id: string) => useQuery({
    queryKey: ["products", id],
    queryFn: () => fetchProductWithDetails(id),
    enabled: !!id
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Product Created",
        description: "New product has been created successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", data.id] });
      toast({
        title: "Product Updated",
        description: "Product has been updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const addIngredientMutation = useMutation({
    mutationFn: addIngredientToProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products", data.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Ingredient Added",
        description: "Ingredient has been added to the product successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateIngredientMutation = useMutation({
    mutationFn: updateProductIngredient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products", data.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Ingredient Updated",
        description: "Product ingredient has been updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const removeIngredientMutation = useMutation({
    mutationFn: ({ id, productId }: { id: string, productId: string }) =>
      removeIngredientFromProduct(id, productId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Ingredient Removed",
        description: "Ingredient has been removed from the product successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
    getProductWithDetails: productDetailQuery,
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    addIngredient: addIngredientMutation.mutate,
    updateIngredient: updateIngredientMutation.mutate,
    removeIngredient: removeIngredientMutation.mutate
  };
}
