
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderItem, Task, TaskTemplate } from "@/types";
import { toast } from "@/hooks/use-toast";

export function useOrders() {
  const queryClient = useQueryClient();

  const fetchOrders = async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      throw new Error(error.message);
    }

    // Convert database rows to Order type
    return data.map(item => ({
      id: item.id,
      customerId: item.customer_id,
      orderDate: new Date(item.order_date),
      deliveryDate: item.delivery_date ? new Date(item.delivery_date) : undefined,
      totalAmount: Number(item.total_amount),
      status: item.status,
      notes: item.notes,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
  };

  const fetchOrderWithItems = async (id: string): Promise<Order> => {
    // Fetch order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (orderError) {
      console.error("Error fetching order:", orderError);
      throw new Error(orderError.message);
    }

    // Fetch order items with product details
    const { data: itemsData, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        id,
        order_id,
        product_id,
        price,
        quantity,
        created_at,
        updated_at,
        products:product_id (
          id,
          name,
          description,
          selling_price,
          cost_price,
          stock,
          min_order
        )
      `)
      .eq("order_id", id);

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      throw new Error(itemsError.message);
    }

    // Convert items data
    const items: OrderItem[] = itemsData.map(item => ({
      id: item.id,
      orderId: item.order_id,
      productId: item.product_id,
      quantity: Number(item.quantity),
      price: Number(item.price),
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      product: item.products ? {
        id: item.products.id,
        name: item.products.name,
        description: item.products.description,
        costPrice: Number(item.products.cost_price),
        sellingPrice: Number(item.products.selling_price),
        stock: Number(item.products.stock),
        minOrder: Number(item.products.min_order),
        createdAt: new Date(), // Not available in join
        updatedAt: new Date()  // Not available in join
      } : undefined
    }));

    // Return order with items
    return {
      id: orderData.id,
      customerId: orderData.customer_id,
      orderDate: new Date(orderData.order_date),
      deliveryDate: orderData.delivery_date ? new Date(orderData.delivery_date) : undefined,
      totalAmount: Number(orderData.total_amount),
      status: orderData.status,
      notes: orderData.notes,
      createdAt: new Date(orderData.created_at),
      updatedAt: new Date(orderData.updated_at),
      items
    };
  };

  const createOrder = async (order: Omit<Order, "id" | "createdAt" | "updatedAt" | "totalAmount">): Promise<Order> => {
    // Calculate total amount from items
    const totalAmount = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    
    // Create order
    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_id: order.customerId,
        order_date: order.orderDate.toISOString(),
        delivery_date: order.deliveryDate?.toISOString(),
        status: order.status,
        notes: order.notes,
        total_amount: totalAmount
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating order:", error);
      throw new Error(error.message);
    }

    const newOrder: Order = {
      id: data.id,
      customerId: data.customer_id,
      orderDate: new Date(data.order_date),
      deliveryDate: data.delivery_date ? new Date(data.delivery_date) : undefined,
      totalAmount: Number(data.total_amount),
      status: data.status,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };

    // If there are items, add them
    if (order.items && order.items.length > 0) {
      const orderItems = order.items.map(item => ({
        order_id: newOrder.id,
        product_id: item.productId,
        price: item.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
        throw new Error(itemsError.message);
      }

      // Create tasks from product task templates
      await createTasksFromOrder(newOrder.id);
    }

    return newOrder;
  };

  const updateOrder = async (order: Partial<Order> & { id: string }): Promise<Order> => {
    // If updating items, recalculate total amount
    if (order.items) {
      order.totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    const { data, error } = await supabase
      .from("orders")
      .update({
        customer_id: order.customerId,
        order_date: order.orderDate?.toISOString(),
        delivery_date: order.deliveryDate?.toISOString(),
        status: order.status,
        notes: order.notes,
        total_amount: order.totalAmount,
        updated_at: new Date().toISOString()
      })
      .eq("id", order.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating order:", error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      customerId: data.customer_id,
      orderDate: new Date(data.order_date),
      deliveryDate: data.delivery_date ? new Date(data.delivery_date) : undefined,
      totalAmount: Number(data.total_amount),
      status: data.status,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  };

  const deleteOrder = async (id: string): Promise<void> => {
    // First delete associated tasks
    const { error: tasksError } = await supabase
      .from("tasks")
      .delete()
      .eq("order_id", id);

    if (tasksError) {
      console.error("Error deleting order tasks:", tasksError);
      throw new Error(tasksError.message);
    }

    // Then delete order items
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", id);

    if (itemsError) {
      console.error("Error deleting order items:", itemsError);
      throw new Error(itemsError.message);
    }

    // Finally delete the order
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting order:", error);
      throw new Error(error.message);
    }
  };

  const addItemToOrder = async (item: Omit<OrderItem, "id" | "createdAt" | "updatedAt">): Promise<OrderItem> => {
    const { data, error } = await supabase
      .from("order_items")
      .insert({
        order_id: item.orderId,
        product_id: item.productId,
        price: item.price,
        quantity: item.quantity
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding item to order:", error);
      throw new Error(error.message);
    }

    // Update order total amount
    await updateOrderTotalAmount(item.orderId);

    // Create tasks if this is an active order
    const { data: orderData } = await supabase
      .from("orders")
      .select("status")
      .eq("id", item.orderId)
      .single();
      
    if (orderData && (orderData.status === 'pending' || orderData.status === 'processing')) {
      await createTasksFromProduct(item.orderId, item.productId);
    }

    return {
      id: data.id,
      orderId: data.order_id,
      productId: data.product_id,
      price: Number(data.price),
      quantity: Number(data.quantity),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  };

  const updateOrderItem = async (item: Partial<OrderItem> & { id: string, orderId: string }): Promise<OrderItem> => {
    const { data, error } = await supabase
      .from("order_items")
      .update({
        price: item.price,
        quantity: item.quantity,
        updated_at: new Date().toISOString()
      })
      .eq("id", item.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating order item:", error);
      throw new Error(error.message);
    }

    // Update order total amount
    await updateOrderTotalAmount(item.orderId);

    return {
      id: data.id,
      orderId: data.order_id,
      productId: data.product_id,
      price: Number(data.price),
      quantity: Number(data.quantity),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  };

  const removeItemFromOrder = async (id: string, orderId: string): Promise<void> => {
    // First delete tasks related to this order item
    const { data: itemData } = await supabase
      .from("order_items")
      .select("product_id")
      .eq("id", id)
      .single();

    if (itemData) {
      const { error: tasksError } = await supabase
        .from("tasks")
        .delete()
        .eq("order_id", orderId)
        .eq("product_id", itemData.product_id);

      if (tasksError) {
        console.error("Error deleting tasks related to order item:", tasksError);
        throw new Error(tasksError.message);
      }
    }

    // Then delete the order item
    const { error } = await supabase
      .from("order_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error removing item from order:", error);
      throw new Error(error.message);
    }

    // Update order total amount
    await updateOrderTotalAmount(orderId);
  };

  // Helper function to calculate and update an order's total amount based on its items
  const updateOrderTotalAmount = async (orderId: string): Promise<void> => {
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("price, quantity")
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Error fetching order items for total calculation:", itemsError);
      throw new Error(itemsError.message);
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

    // Update order total amount
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        total_amount: totalAmount,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order total amount:", updateError);
      throw new Error(updateError.message);
    }
  };

  // Helper function to create tasks from product templates when an order is created
  const createTasksFromOrder = async (orderId: string): Promise<void> => {
    // Get all products in this order
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id")
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Error fetching order items for task creation:", itemsError);
      throw new Error(itemsError.message);
    }

    // For each product, create tasks from its templates
    for (const item of orderItems) {
      await createTasksFromProduct(orderId, item.product_id);
    }
  };

  // Helper function to create tasks from a product's task templates
  const createTasksFromProduct = async (orderId: string, productId: string): Promise<void> => {
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

    // Create parent tasks and map their IDs
    const templateTaskMap: Record<string, string> = {};
    
    for (const template of templates) {
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

  // Define queries and mutations
  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders
  });

  const orderDetailQuery = (id: string) => useQuery({
    queryKey: ["orders", id],
    queryFn: () => fetchOrderWithItems(id),
    enabled: !!id
  });

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Order Created",
        description: "New order has been created successfully"
      });
      // Also invalidate tasks since new tasks may have been created
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: updateOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", data.id] });
      toast({
        title: "Order Updated",
        description: "Order has been updated successfully"
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

  const deleteOrderMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Order Deleted",
        description: "Order has been deleted successfully"
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

  const addItemMutation = useMutation({
    mutationFn: addItemToOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders", data.orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Item Added",
        description: "Item has been added to the order successfully"
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

  const updateItemMutation = useMutation({
    mutationFn: updateOrderItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders", data.orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Item Updated",
        description: "Order item has been updated successfully"
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

  const removeItemMutation = useMutation({
    mutationFn: ({ id, orderId }: { id: string, orderId: string }) =>
      removeItemFromOrder(id, orderId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Item Removed",
        description: "Item has been removed from the order successfully"
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
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    error: ordersQuery.error,
    getOrderWithItems: orderDetailQuery,
    createOrder: createOrderMutation.mutate,
    updateOrder: updateOrderMutation.mutate,
    deleteOrder: deleteOrderMutation.mutate,
    addItem: addItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    removeItem: removeItemMutation.mutate
  };
}
