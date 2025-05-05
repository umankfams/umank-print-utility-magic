
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus } from "@/types";
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

    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status as TaskStatus,
      priority: item.priority,
      parentTaskId: item.parent_task_id,
      orderId: item.order_id,
      ingredientId: item.ingredient_id,
      productId: item.product_id,
      taskType: item.task_type,
      deadline: item.deadline ? new Date(item.deadline) : undefined,
      assigneeId: item.assignee_id,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      productName: item.products?.name,
      ingredientName: item.ingredients?.name
    }));
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
        assigneeId: task.assigneeId,
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
      priority: data.priority,
      parentTaskId: data.parent_task_id,
      orderId: data.order_id,
      ingredientId: data.ingredient_id,
      productId: data.product_id,
      taskType: data.task_type,
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
