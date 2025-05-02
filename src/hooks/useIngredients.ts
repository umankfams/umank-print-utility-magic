
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ingredient, TaskTemplate } from "@/types";
import { toast } from "@/hooks/use-toast";

export function useIngredients() {
  const queryClient = useQueryClient();

  const fetchIngredients = async (): Promise<Ingredient[]> => {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching ingredients:", error);
      throw new Error(error.message);
    }

    // Convert database rows to Ingredient type
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      stock: Number(item.stock),
      pricePerUnit: Number(item.price_per_unit),
      unit: item.unit,
      branchId: item.branch_id,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
  };

  const fetchIngredientWithTasks = async (id: string): Promise<Ingredient> => {
    // Fetch ingredient
    const { data: ingredientData, error: ingredientError } = await supabase
      .from("ingredients")
      .select("*")
      .eq("id", id)
      .single();

    if (ingredientError) {
      console.error("Error fetching ingredient:", ingredientError);
      throw new Error(ingredientError.message);
    }

    // Fetch associated tasks
    const { data: taskData, error: taskError } = await supabase
      .from("task_templates")
      .select("*")
      .eq("ingredient_id", id);

    if (taskError) {
      console.error("Error fetching tasks:", taskError);
      throw new Error(taskError.message);
    }

    // Convert task data
    const tasks: TaskTemplate[] = taskData.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      ingredientId: task.ingredient_id,
      productId: task.product_id,
      isSubtask: task.is_subtask || false,
      parentTemplateId: task.parent_template_id,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at)
    }));

    // Return ingredient with tasks
    return {
      id: ingredientData.id,
      name: ingredientData.name,
      description: ingredientData.description,
      stock: Number(ingredientData.stock),
      pricePerUnit: Number(ingredientData.price_per_unit),
      unit: ingredientData.unit,
      branchId: ingredientData.branch_id,
      createdAt: new Date(ingredientData.created_at),
      updatedAt: new Date(ingredientData.updated_at),
      tasks
    };
  };

  const createIngredient = async (ingredient: Omit<Ingredient, "id" | "createdAt" | "updatedAt">): Promise<Ingredient> => {
    const { data, error } = await supabase
      .from("ingredients")
      .insert({
        name: ingredient.name,
        description: ingredient.description,
        stock: ingredient.stock,
        price_per_unit: ingredient.pricePerUnit,
        unit: ingredient.unit,
        branch_id: ingredient.branchId
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating ingredient:", error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      stock: Number(data.stock),
      pricePerUnit: Number(data.price_per_unit),
      unit: data.unit,
      branchId: data.branch_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  };

  const updateIngredient = async (ingredient: Partial<Ingredient> & { id: string }): Promise<Ingredient> => {
    const { data, error } = await supabase
      .from("ingredients")
      .update({
        name: ingredient.name,
        description: ingredient.description,
        stock: ingredient.stock,
        price_per_unit: ingredient.pricePerUnit,
        unit: ingredient.unit,
        branch_id: ingredient.branchId,
        updated_at: new Date().toISOString()
      })
      .eq("id", ingredient.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating ingredient:", error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      stock: Number(data.stock),
      pricePerUnit: Number(data.price_per_unit),
      unit: data.unit,
      branchId: data.branch_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  };

  const deleteIngredient = async (id: string): Promise<void> => {
    // First check if this ingredient is used in any product
    const { data: productData, error: productError } = await supabase
      .from("product_ingredients")
      .select("id")
      .eq("ingredient_id", id);

    if (productError) {
      console.error("Error checking product ingredients:", productError);
      throw new Error(productError.message);
    }

    if (productData && productData.length > 0) {
      throw new Error("This ingredient is used in products and cannot be deleted");
    }

    // Delete associated task templates first
    const { error: taskError } = await supabase
      .from("task_templates")
      .delete()
      .eq("ingredient_id", id);

    if (taskError) {
      console.error("Error deleting task templates:", taskError);
      throw new Error(taskError.message);
    }

    // Then delete the ingredient
    const { error } = await supabase
      .from("ingredients")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting ingredient:", error);
      throw new Error(error.message);
    }
  };

  // Task template management functions
  const createTaskTemplate = async (task: Omit<TaskTemplate, "id" | "createdAt" | "updatedAt">): Promise<TaskTemplate> => {
    const { data, error } = await supabase
      .from("task_templates")
      .insert({
        title: task.title,
        description: task.description,
        priority: task.priority,
        ingredient_id: task.ingredientId,
        product_id: task.productId,
        is_subtask: task.isSubtask,
        parent_template_id: task.parentTemplateId
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating task template:", error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      ingredientId: data.ingredient_id,
      productId: data.product_id,
      isSubtask: data.is_subtask || false,
      parentTemplateId: data.parent_template_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  };

  const deleteTaskTemplate = async (id: string): Promise<void> => {
    // First delete any subtasks
    const { error: subtaskError } = await supabase
      .from("task_templates")
      .delete()
      .eq("parent_template_id", id);

    if (subtaskError) {
      console.error("Error deleting subtasks:", subtaskError);
      throw new Error(subtaskError.message);
    }

    // Then delete the task template
    const { error } = await supabase
      .from("task_templates")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting task template:", error);
      throw new Error(error.message);
    }
  };

  // Define queries and mutations
  const ingredientsQuery = useQuery({
    queryKey: ["ingredients"],
    queryFn: fetchIngredients
  });

  const ingredientDetailQuery = (id: string) => useQuery({
    queryKey: ["ingredients", id],
    queryFn: () => fetchIngredientWithTasks(id),
    enabled: !!id
  });

  const createIngredientMutation = useMutation({
    mutationFn: createIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      toast({
        title: "Ingredient Created",
        description: "New ingredient has been created successfully"
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
    mutationFn: updateIngredient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["ingredients", data.id] });
      toast({
        title: "Ingredient Updated",
        description: "Ingredient has been updated successfully"
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

  const deleteIngredientMutation = useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      toast({
        title: "Ingredient Deleted",
        description: "Ingredient has been deleted successfully"
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

  const createTaskTemplateMutation = useMutation({
    mutationFn: createTaskTemplate,
    onSuccess: (data) => {
      if (data.ingredientId) {
        queryClient.invalidateQueries({ queryKey: ["ingredients", data.ingredientId] });
      }
      if (data.productId) {
        queryClient.invalidateQueries({ queryKey: ["products", data.productId] });
      }
      toast({
        title: "Task Template Created",
        description: "New task template has been created successfully"
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

  const deleteTaskTemplateMutation = useMutation({
    mutationFn: deleteTaskTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Task Template Deleted",
        description: "Task template has been deleted successfully"
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
    ingredients: ingredientsQuery.data || [],
    isLoading: ingredientsQuery.isLoading,
    error: ingredientsQuery.error,
    getIngredientWithTasks: ingredientDetailQuery,
    createIngredient: createIngredientMutation.mutate,
    updateIngredient: updateIngredientMutation.mutate,
    deleteIngredient: deleteIngredientMutation.mutate,
    createTaskTemplate: createTaskTemplateMutation.mutate,
    deleteTaskTemplate: deleteTaskTemplateMutation.mutate
  };
}
