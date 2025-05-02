
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
import { useProducts } from "@/hooks/useProducts";
import { useIngredients } from "@/hooks/useIngredients";
import { Product, Ingredient } from "@/types";
import { Plus, TrashIcon, EditIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  // Cost price is calculated automatically
  sellingPrice: z.number().min(0, "Price cannot be negative"),
  stock: z.number().min(0, "Stock cannot be negative"),
  minOrder: z.number().min(1, "Minimum order must be at least 1"),
});

const ingredientSchema = z.object({
  ingredientId: z.string().min(1, "Ingredient is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
});

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  isSubtask: z.boolean().default(false),
  parentTemplateId: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;
type IngredientFormValues = z.infer<typeof ingredientSchema>;
type TaskFormValues = z.infer<typeof taskSchema>;

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

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      sellingPrice: 0,
      stock: 0,
      minOrder: 1,
    },
  });

  const ingredientForm = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      ingredientId: "",
      quantity: 1,
    },
  });

  const taskForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      isSubtask: false,
      parentTemplateId: undefined,
    },
  });

  const { data: productWithDetails } = getProductWithDetails(selectedProduct?.id || "");

  const onSubmit = (values: ProductFormValues) => {
    if (isEditing && selectedProduct) {
      updateProduct({
        id: selectedProduct.id,
        ...values,
      });
    } else {
      createProduct({
        ...values,
        costPrice: 0, // Will be calculated when ingredients are added
      });
    }
    setOpenDialog(false);
    resetForm();
  };

  const onSubmitIngredient = (values: IngredientFormValues) => {
    if (selectedProduct) {
      // Find the selected ingredient to get its unit price
      const selectedIngredient = ingredients.find(
        (i) => i.id === values.ingredientId
      );

      if (selectedIngredient) {
        addIngredient({
          productId: selectedProduct.id,
          ingredientId: values.ingredientId,
          quantity: values.quantity,
        });
      }
    }
    setOpenIngredientDialog(false);
    ingredientForm.reset();
  };

  const onSubmitTask = (values: TaskFormValues) => {
    if (selectedProduct) {
      createTaskTemplate({
        ...values,
        ingredientId: undefined,
        productId: selectedProduct.id,
      });
    }
    setOpenTaskDialog(false);
    taskForm.reset();
  };

  const resetForm = () => {
    form.reset();
    setIsEditing(false);
    setSelectedProduct(null);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    
    form.reset({
      name: product.name,
      description: product.description || "",
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      minOrder: product.minOrder,
    });
    
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  const handleAddIngredient = (product: Product) => {
    setSelectedProduct(product);
    ingredientForm.reset();
    setOpenIngredientDialog(true);
  };

  const handleRemoveIngredient = (id: string, productId: string) => {
    if (confirm("Are you sure you want to remove this ingredient?")) {
      removeIngredient({ id, productId });
    }
  };

  const handleAddTask = (product: Product) => {
    setSelectedProduct(product);
    taskForm.reset();
    setOpenTaskDialog(true);
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setOpenDialog(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Product" : "Add New Product"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? "Update the product details below"
                    : "Fill in the details for the new product"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter description (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? 0
                                    : parseFloat(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="minOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Order</FormLabel>
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
                  </div>

                  <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit">
                      {isEditing ? "Update Product" : "Add Product"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-start">
                  <span>{product.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  {product.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Cost Price:</span>
                    <span className="font-medium">
                      ${product.costPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selling Price:</span>
                    <span className="font-medium">
                      ${product.sellingPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stock:</span>
                    <span className="font-medium">
                      {product.stock} units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min Order:</span>
                    <span className="font-medium">
                      {product.minOrder} units
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedProduct(product)}
                    >
                      Ingredients
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[800px] w-full">
                    <DialogHeader>
                      <DialogTitle>Ingredients for {product.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Product Ingredients</h3>
                        <Button
                          size="sm"
                          onClick={() => handleAddIngredient(product)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Ingredient
                        </Button>
                      </div>
                      {productWithDetails?.ingredients?.length ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ingredient</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead>Cost</TableHead>
                              <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {productWithDetails.ingredients.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.ingredient?.name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.ingredient?.unit}</TableCell>
                                <TableCell>
                                  ${(
                                    (item.ingredient?.pricePerUnit || 0) *
                                    item.quantity
                                  ).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveIngredient(item.id, product.id)}
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
                          No ingredients added to this product.
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedProduct(product)}
                    >
                      Tasks
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[800px] w-full">
                    <DialogHeader>
                      <DialogTitle>Tasks for {product.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Product Tasks</h3>
                        <Button
                          size="sm"
                          onClick={() => handleAddTask(product)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Task
                        </Button>
                      </div>
                      {productWithDetails?.tasks?.length ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Priority</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {productWithDetails.tasks.map((task) => (
                              <TableRow key={task.id}>
                                <TableCell>{task.title}</TableCell>
                                <TableCell>{task.description || "-"}</TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      task.priority === "high"
                                        ? "bg-red-100 text-red-800"
                                        : task.priority === "medium"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {task.isSubtask ? "Subtask" : "Main Task"}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteTask(task.id)}
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
                          No tasks defined for this product.
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              No products found. Click "Add Product" to create one.
            </p>
          </div>
        )}
      </div>

      {/* Ingredient Dialog */}
      <Dialog open={openIngredientDialog} onOpenChange={setOpenIngredientDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Ingredient</DialogTitle>
            <DialogDescription>
              Add an ingredient to {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...ingredientForm}>
            <form onSubmit={ingredientForm.handleSubmit(onSubmitIngredient)} className="space-y-4">
              <FormField
                control={ingredientForm.control}
                name="ingredientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredient</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        {...field}
                      >
                        <option value="">Select an ingredient</option>
                        {ingredients.map((ingredient) => (
                          <option key={ingredient.id} value={ingredient.id}>
                            {ingredient.name} (${ingredient.pricePerUnit.toFixed(2)} per {ingredient.unit})
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={ingredientForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">Add Ingredient</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={openTaskDialog} onOpenChange={setOpenTaskDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>
              Create a task template for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...taskForm}>
            <form onSubmit={taskForm.handleSubmit(onSubmitTask)} className="space-y-4">
              <FormField
                control={taskForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={taskForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task description (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={taskForm.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        {...field}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={taskForm.control}
                name="isSubtask"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        This is a subtask
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Check this if this task is a subtask of another task
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {taskForm.watch("isSubtask") && productWithDetails?.tasks?.filter(t => !t.isSubtask).length > 0 && (
                <FormField
                  control={taskForm.control}
                  name="parentTemplateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Task</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          {...field}
                        >
                          <option value="">Select parent task</option>
                          {productWithDetails?.tasks
                            ?.filter(t => !t.isSubtask)
                            .map((task) => (
                              <option key={task.id} value={task.id}>
                                {task.title}
                              </option>
                            ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button type="submit">Create Task</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
