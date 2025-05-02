
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppNavbar from "@/components/AppNavbar";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { Order, OrderStatus } from "@/types";
import { Plus, TrashIcon, EditIcon, ShoppingCartIcon, Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const orderSchema = z.object({
  customerId: z.string().optional(),
  orderDate: z.string().min(1, "Order date is required"),
  deliveryDate: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
});

const orderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

type OrderFormValues = z.infer<typeof orderSchema>;
type OrderItemFormValues = z.infer<typeof orderItemSchema>;

const Orders = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  
  const {
    orders,
    isLoading,
    error,
    getOrderWithItems,
    createOrder,
    updateOrder,
    deleteOrder,
    addItem,
    removeItem,
  } = useOrders();

  const { products } = useProducts();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerId: "",
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: "",
      status: "pending",
      notes: "",
    },
  });

  const itemForm = useForm<OrderItemFormValues>({
    resolver: zodResolver(orderItemSchema),
    defaultValues: {
      productId: "",
      quantity: 1,
    },
  });

  const { data: orderWithItems } = getOrderWithItems(selectedOrder?.id || "");

  const onSubmit = (values: OrderFormValues) => {
    if (isEditing && selectedOrder) {
      updateOrder({
        id: selectedOrder.id,
        customerId: values.customerId || undefined,
        orderDate: new Date(values.orderDate),
        deliveryDate: values.deliveryDate ? new Date(values.deliveryDate) : undefined,
        status: values.status as OrderStatus,
        notes: values.notes,
      });
    } else {
      createOrder({
        customerId: values.customerId || undefined,
        orderDate: new Date(values.orderDate),
        deliveryDate: values.deliveryDate ? new Date(values.deliveryDate) : undefined,
        status: values.status as OrderStatus,
        notes: values.notes,
        items: [],
      });
    }
    setOpenDialog(false);
    resetForm();
  };

  const onSubmitItem = (values: OrderItemFormValues) => {
    if (selectedOrder) {
      // Find the selected product to get its price
      const selectedProduct = products.find(
        (p) => p.id === values.productId
      );

      if (selectedProduct) {
        addItem({
          orderId: selectedOrder.id,
          productId: values.productId,
          quantity: values.quantity,
          price: selectedProduct.sellingPrice,
        });
      }
    }
    setOpenItemDialog(false);
    itemForm.reset();
  };

  const resetForm = () => {
    form.reset({
      customerId: "",
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: "",
      status: "pending",
      notes: "",
    });
    setIsEditing(false);
    setSelectedOrder(null);
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setIsEditing(true);
    
    form.reset({
      customerId: order.customerId || "",
      orderDate: new Date(order.orderDate).toISOString().split('T')[0],
      deliveryDate: order.deliveryDate 
        ? new Date(order.deliveryDate).toISOString().split('T')[0] 
        : "",
      status: order.status,
      notes: order.notes || "",
    });
    
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      deleteOrder(id);
    }
  };

  const handleAddItem = (order: Order) => {
    setSelectedOrder(order);
    itemForm.reset();
    setOpenItemDialog(true);
  };

  const handleRemoveItem = (id: string, orderId: string) => {
    if (confirm("Are you sure you want to remove this item?")) {
      removeItem({ id, orderId });
    }
  };

  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (isLoading) {
    return (
      <div>
        <AppNavbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Orders</h1>
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
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-red-500">Error loading orders</p>
        </div>
      </div>
    );
  }

  const statusOptions: { value: OrderStatus | "all"; label: string }[] = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Orders</h1>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setOpenDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Order
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {isEditing ? "Edit Order" : "Create New Order"}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditing
                      ? "Update the order details below"
                      : "Fill in the details for the new order"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer ID (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Customer ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="orderDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliveryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Date (optional)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                              {...field}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Add any notes here" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="submit">
                        {isEditing ? "Update Order" : "Create Order"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <Card className="border border-dashed">
              <CardContent className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <ShoppingCartIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-medium">No Orders Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {statusFilter === "all"
                    ? "You haven't created any orders yet."
                    : `You don't have any orders with "${statusFilter}" status.`}
                </p>
                <Button onClick={() => { resetForm(); setOpenDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Order
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id.substring(0, 8)}
                      </CardTitle>
                      <CardDescription>
                        Created on {new Date(order.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(order)}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(order.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Status:</span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : order.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Order Date:</span>{" "}
                      {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                    {order.deliveryDate && (
                      <div>
                        <span className="font-medium">Delivery Date:</span>{" "}
                        {new Date(order.deliveryDate).toLocaleDateString()}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Total Amount:</span>{" "}
                      ${order.totalAmount.toFixed(2)}
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mb-4"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Order Items
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[800px] w-full">
                      <DialogHeader>
                        <DialogTitle>Order Items</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">
                            Order #{order.id.substring(0, 8)} Items
                          </h3>
                          <Button
                            size="sm"
                            onClick={() => handleAddItem(order)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                          </Button>
                        </div>
                        {orderWithItems?.items?.length ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {orderWithItems.items.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.product?.name}</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>${item.price.toFixed(2)}</TableCell>
                                  <TableCell>
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleRemoveItem(item.id, order.id)
                                      }
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-muted-foreground">
                            No items in this order yet.
                          </p>
                        )}
                        
                        <div className="flex justify-end pt-4 border-t">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="text-lg font-medium">
                              ${orderWithItems?.totalAmount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {order.notes && (
                    <div className="border-t pt-2 mt-2">
                      <p className="text-sm font-medium mb-1">Notes:</p>
                      <p className="text-sm text-muted-foreground">{order.notes}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAddItem(order)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Item Dialog */}
      <Dialog open={openItemDialog} onOpenChange={setOpenItemDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Product to Order</DialogTitle>
            <DialogDescription>
              Add a product to order #{selectedOrder?.id.substring(0, 8)}
            </DialogDescription>
          </DialogHeader>
          <Form {...itemForm}>
            <form onSubmit={itemForm.handleSubmit(onSubmitItem)} className="space-y-4">
              <FormField
                control={itemForm.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        {...field}
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} (${product.sellingPrice.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={itemForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? 1
                              : parseInt(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {itemForm.watch("productId") && (
                <div className="border rounded-md p-3 bg-muted/50">
                  <h4 className="font-medium mb-1 text-sm">Product Details</h4>
                  {(() => {
                    const selectedProduct = products.find(
                      (p) => p.id === itemForm.watch("productId")
                    );
                    if (!selectedProduct) return null;
                    
                    const quantity = itemForm.watch("quantity") || 1;
                    const totalPrice = selectedProduct.sellingPrice * quantity;
                    
                    return (
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Price per unit:</span>
                          <span>${selectedProduct.sellingPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total price:</span>
                          <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stock available:</span>
                          <span>
                            {selectedProduct.stock} {selectedProduct.stock === 1 ? "unit" : "units"}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <DialogFooter>
                <Button type="submit">Add to Order</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
