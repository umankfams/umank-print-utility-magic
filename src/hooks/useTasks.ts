
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus, TaskPriority, TaskType } from "@/types";
import { toast } from "@/hooks/use-toast";

export function useTasks(orderStatus?: string) {
  const queryClient = useQueryClient();

  // Fetch tasks
  const fetchTasks = async (): Promise<Task[]> => {
    let query = supabase
      .from("tasks")
      .select(`
        *,
        products:product_id (name),
        ingredients:ingredient_id (name)
      `);

    // If orderStatus is provided, filter tasks by orders with that status
    if (orderStatus) {
      const { data: orderIds, error: orderError } = await supabase
        .from("orders")
        .select("id")
        .eq("status", orderStatus);

      if (orderError) {
        console.error("Error fetching orders:", orderError);
        throw new Error(orderError.message);
      }

      if (orderIds && orderIds.length > 0) {
        const ids = orderIds.map(order => order.id);
        query = query.in("order_id", ids);
      } else {
        // If no orders with the specified status, return empty array
        return [];
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching tasks:", error);
      throw new Error(error.message);
    }

    // If no tasks found, attempt to create them from order products
    if (data && data.length === 0 && orderStatus === 'processing') {
      console.log("No tasks found for processing orders, attempting to create them");
      const { data: orderIds } = await supabase
        .from("orders")
        .select("id")
        .eq("status", orderStatus);
        
      if (orderIds && orderIds.length > 0) {
        for (const order of orderIds) {
          await createTasksFromOrder(order.id);
        }
        
        // Try fetching tasks again after creation
        const { data: newData, error: newError } = await query;
        
        if (newError) {
          console.error("Error fetching newly created tasks:", newError);
          throw new Error(newError.message);
        }
        
        return transformTasksData(newData || []);
      }
    }

    return transformTasksData(data || []);
  };

  // Helper function to transform database rows to Task objects
  const transformTasksData = (data: any[]): Task[] => {
    return data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status as TaskStatus,
      priority: item.priority as TaskPriority,
      parentTaskId: item.parent_task_id,
      orderId: item.order_id,
      ingredientId: item.ingredient_id,
      productId: item.product_id,
      taskType: item.task_type as TaskType,
      deadline: item.deadline ? new Date(item.deadline) : undefined,
      assigneeId: item.assignee_id,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      productName: item.products?.name,
      ingredientName: item.ingredients?.name
    }));
  };

  // Helper function to create tasks from product templates when an order is created
  const createTasksFromOrder = async (orderId: string): Promise<void> => {
    console.log("Creating tasks for order:", orderId);
    // Get all products in this order
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id")
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Error fetching order items for task creation:", itemsError);
      throw new Error(itemsError.message);
    }

    console.log("Found order items:", orderItems);
    
    // For each product, create tasks from its templates
    for (const item of orderItems) {
      await createTasksFromProduct(orderId, item.product_id);
    }
  };

  // Helper function to create tasks from a product's task templates
  const createTasksFromProduct = async (orderId: string, productId: string): Promise<void> => {
    console.log("Creating tasks for product:", productId, "in order:", orderId);
    
    // Get task templates for this product
    const { data: templates, error: templatesError } = await supabase
      .from("task_templates")
      .select("*")
      .eq("product_id", productId)
      .eq("is_subtask", false); // Get only parent tasks

    if (templatesError) {
      console.error("Error fetching product task templates:", templatesError);
      throw new Error(templatesError.message);
    }

    console.log("Found task templates:", templates);

    // If no product templates exist, try to get ingredient-based tasks
    if (!templates || templates.length === 0) {
      await createTasksFromProductIngredients(orderId, productId);
      return;
    }

    // Create parent tasks and map their IDs
    const templateTaskMap: Record<string, string> = {};
    
    for (const template of templates) {
      // Check if this task already exists for this order and product
      const { data: existingTasks } = await supabase
        .from("tasks")
        .select("id")
        .eq("order_id", orderId)
        .eq("product_id", productId)
        .eq("title", template.title);
        
      if (existingTasks && existingTasks.length > 0) {
        console.log("Task already exists:", template.title);
        templateTaskMap[template.id] = existingTasks[0].id;
        continue;
      }
      
      // Create parent task
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .insert({
          title: template.title,
          description: template.description,
          priority: template.priority,
          status: 'todo',
          order_id: orderId,
          product_id: productId,
          ingredient_id: template.ingredient_id,
          task_type: 'automatic'
        })
        .select()
        .single();

      if (taskError) {
        console.error("Error creating task from template:", taskError);
        throw new Error(taskError.message);
      }

      console.log("Created task:", taskData);
      
      // Store the mapping between template ID and new task ID
      templateTaskMap[template.id] = taskData.id;

      // Get subtasks for this template
      const { data: subtemplates, error: subtemplatesError } = await supabase
        .from("task_templates")
        .select("*")
        .eq("parent_template_id", template.id);

      if (subtemplatesError) {
        console.error("Error fetching subtask templates:", subtemplatesError);
        throw new Error(subtemplatesError.message);
      }

      console.log("Found subtemplates:", subtemplates);
      
      // Create subtasks
      for (const subtemplate of subtemplates) {
        await supabase
          .from("tasks")
          .insert({
            title: subtemplate.title,
            description: subtemplate.description,
            priority: subtemplate.priority,
            status: 'todo',
            parent_task_id: templateTaskMap[template.id],
            order_id: orderId,
            product_id: productId,
            ingredient_id: subtemplate.ingredient_id,
            task_type: 'automatic'
          });
      }
    }
  };

  // New helper function to create tasks from product ingredients when no templates exist
  const createTasksFromProductIngredients = async (orderId: string, productId: string): Promise<void> => {
    console.log("Creating tasks from ingredients for product:", productId);
    
    // Get the product details to include in task titles
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("name")
      .eq("id", productId)
      .single();
      
    if (productError) {
      console.error("Error fetching product details:", productError);
      throw new Error(productError.message);
    }
    
    const productName = product?.name || "Product";
    
    // Get ingredients associated with this product
    const { data: productIngredients, error: ingredientsError } = await supabase
      .from("product_ingredients")
      .select(`
        quantity,
        ingredients:ingredient_id (id, name)
      `)
      .eq("product_id", productId);
      
    if (ingredientsError) {
      console.error("Error fetching product ingredients:", ingredientsError);
      throw new Error(ingredientsError.message);
    }
    
    console.log("Found product ingredients:", productIngredients);
    
    // If no ingredients, create default tasks
    if (!productIngredients || productIngredients.length === 0) {
      console.log("No ingredients found, creating default tasks");
      await createDefaultTasksForProduct(orderId, productId);
      return;
    }
    
    // Check if tasks already exist
    const { data: existingTasks } = await supabase
      .from("tasks")
      .select("id")
      .eq("order_id", orderId)
      .eq("product_id", productId);
      
    if (existingTasks && existingTasks.length > 0) {
      console.log("Tasks already exist for this product in this order");
      return;
    }
    
    // For each ingredient, check if it has task templates
    for (const productIngredient of productIngredients) {
      const ingredientId = productIngredient.ingredients?.id;
      const ingredientName = productIngredient.ingredients?.name || "Ingredient";
      
      if (!ingredientId) continue;
      
      // Get task templates for this ingredient
      const { data: ingredientTemplates, error: templatesError } = await supabase
        .from("task_templates")
        .select("*")
        .eq("ingredient_id", ingredientId)
        .eq("is_subtask", false);
        
      if (templatesError) {
        console.error("Error fetching ingredient task templates:", templatesError);
        throw new Error(templatesError.message);
      }
      
      console.log(`Found ${ingredientTemplates?.length || 0} templates for ingredient ${ingredientName}`);
      
      // If the ingredient has templates, create tasks from them
      if (ingredientTemplates && ingredientTemplates.length > 0) {
        const templateTaskMap: Record<string, string> = {};
        
        for (const template of ingredientTemplates) {
          // Create parent task
          const taskTitle = `${template.title} for ${productName} (${ingredientName})`;
          
          const { data: taskData, error: taskError } = await supabase
            .from("tasks")
            .insert({
              title: taskTitle,
              description: template.description,
              priority: template.priority,
              status: 'todo',
              order_id: orderId,
              product_id: productId,
              ingredient_id: ingredientId,
              task_type: 'automatic'
            })
            .select()
            .single();
            
          if (taskError) {
            console.error("Error creating ingredient task:", taskError);
            throw new Error(taskError.message);
          }
          
          console.log("Created ingredient task:", taskTitle);
          
          // Store the mapping between template ID and new task ID
          templateTaskMap[template.id] = taskData.id;
          
          // Get subtasks for this template
          const { data: subtemplates, error: subtemplatesError } = await supabase
            .from("task_templates")
            .select("*")
            .eq("parent_template_id", template.id);
            
          if (subtemplatesError) {
            console.error("Error fetching ingredient subtask templates:", subtemplatesError);
            throw new Error(subtemplatesError.message);
          }
          
          // Create subtasks
          for (const subtemplate of subtemplates) {
            const subtaskTitle = `${subtemplate.title} for ${productName} (${ingredientName})`;
            
            await supabase
              .from("tasks")
              .insert({
                title: subtaskTitle,
                description: subtemplate.description,
                priority: subtemplate.priority,
                status: 'todo',
                parent_task_id: templateTaskMap[template.id],
                order_id: orderId,
                product_id: productId,
                ingredient_id: ingredientId,
                task_type: 'automatic'
              });
              
            console.log("Created ingredient subtask:", subtaskTitle);
          }
        }
      }
    }
    
    // If no tasks were created from ingredients, create default tasks
    const { data: createdTasks } = await supabase
      .from("tasks")
      .select("id")
      .eq("order_id", orderId)
      .eq("product_id", productId);
      
    if (!createdTasks || createdTasks.length === 0) {
      console.log("No tasks were created from ingredients, creating default tasks");
      await createDefaultTasksForProduct(orderId, productId);
    }
  };

  // Helper function to create default tasks when no templates exist
  const createDefaultTasksForProduct = async (orderId: string, productId: string): Promise<void> => {
    console.log("Creating default tasks for product:", productId);
    
    // Get product details to use in task titles
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("name")
      .eq("id", productId)
      .single();
      
    if (productError) {
      console.error("Error fetching product details:", productError);
      throw new Error(productError.message);
    }
    
    const productName = product?.name || "Product";
    
    // Check if tasks already exist
    const { data: existingTasks } = await supabase
      .from("tasks")
      .select("id")
      .eq("order_id", orderId)
      .eq("product_id", productId);
      
    if (existingTasks && existingTasks.length > 0) {
      console.log("Tasks already exist for this product in this order");
      return;
    }
    
    // Default tasks for a product
    const defaultTasks = [
      {
        title: `Prepare ${productName}`,
        description: `Initial preparation for ${productName}`,
        priority: 'high' as TaskPriority,
        subtasks: [
          {
            title: `Gather materials for ${productName}`,
            description: `Collect all required materials for ${productName}`,
            priority: 'medium' as TaskPriority
          }
        ]
      },
      {
        title: `Assemble ${productName}`,
        description: `Assembly process for ${productName}`,
        priority: 'medium' as TaskPriority,
        subtasks: [
          {
            title: `Quality check for ${productName}`,
            description: `Perform quality inspection for ${productName}`,
            priority: 'high' as TaskPriority
          }
        ]
      },
      {
        title: `Finalize ${productName}`,
        description: `Complete production of ${productName}`,
        priority: 'medium' as TaskPriority
      }
    ];
    
    // Create the default tasks
    for (const task of defaultTasks) {
      // Create parent task
      const { data: parentTask, error: parentError } = await supabase
        .from("tasks")
        .insert({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: 'todo',
          order_id: orderId,
          product_id: productId,
          task_type: 'automatic'
        })
        .select()
        .single();
        
      if (parentError) {
        console.error("Error creating default task:", parentError);
        throw new Error(parentError.message);
      }
      
      console.log("Created default task:", parentTask.title);
      
      // Create subtasks if any
      if (task.subtasks && task.subtasks.length > 0) {
        for (const subtask of task.subtasks) {
          const { error: subtaskError } = await supabase
            .from("tasks")
            .insert({
              title: subtask.title,
              description: subtask.description,
              priority: subtask.priority,
              status: 'todo',
              parent_task_id: parentTask.id,
              order_id: orderId,
              product_id: productId,
              task_type: 'automatic'
            });
            
          if (subtaskError) {
            console.error("Error creating default subtask:", subtaskError);
            throw new Error(subtaskError.message);
          }
          
          console.log("Created default subtask:", subtask.title);
        }
      }
    }
  };

  // Update task status
  const updateTaskStatus = async ({ id, status }: { id: string; status: TaskStatus }): Promise<void> => {
    const { error } = await supabase
      .from("tasks")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error updating task status:", error);
      throw new Error(error.message);
    }
  };

  // Update task
  const updateTask = async (task: Partial<Task> & { id: string }): Promise<void> => {
    const { error } = await supabase
      .from("tasks")
      .update({
        title: task.title,
        description: task.description,
        priority: task.priority,
        deadline: task.deadline?.toISOString(),
        assignee_id: task.assigneeId,
        status: task.status,
        updated_at: new Date().toISOString()
      })
      .eq("id", task.id);

    if (error) {
      console.error("Error updating task:", error);
      throw new Error(error.message);
    }
  };

  // Create task
  const createTask = async (task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> => {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority || 'medium',
        parent_task_id: task.parentTaskId,
        order_id: task.orderId,
        ingredient_id: task.ingredientId,
        product_id: task.productId,
        task_type: task.taskType || 'manual',
        deadline: task.deadline?.toISOString(),
        assignee_id: task.assigneeId
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating task:", error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status as TaskStatus,
      priority: data.priority as TaskPriority,
      parentTaskId: data.parent_task_id,
      orderId: data.order_id,
      ingredientId: data.ingredient_id,
      productId: data.product_id,
      taskType: data.task_type as TaskType,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      assigneeId: data.assignee_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  };

  // Delete task
  const deleteTask = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting task:", error);
      throw new Error(error.message);
    }
  };

  // Group tasks by status
  const groupTasksByStatus = (tasks: Task[]) => {
    const grouped: Record<TaskStatus, Task[]> = {
      'todo': [],
      'in-progress': [],
      'completed': [],
      'cancelled': []
    };

    tasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      } else {
        grouped['todo'].push(task);
      }
    });

    return grouped;
  };

  // Setup query and mutations
  const tasksQuery = useQuery({
    queryKey: ["tasks", orderStatus],
    queryFn: fetchTasks
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Task status updated",
        description: "Task status has been updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update task status: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Task updated",
        description: "Task has been updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Task created",
        description: "New task has been created successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create task: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    groupedTasks: tasksQuery.data ? groupTasksByStatus(tasksQuery.data) : null,
    updateTaskStatus: updateTaskStatusMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    createTask: createTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate
  };
}
