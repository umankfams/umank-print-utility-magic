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
import { useIngredients } from "@/hooks/useIngredients";
import { Ingredient, TaskTemplate, IngredientUnit, TaskPriority } from "@/types";
import { Plus, EditIcon, TrashIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const ingredientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  stock: z.number().min(0, "Stock cannot be negative"),
  pricePerUnit: z.number().min(0, "Price cannot be negative"),
  unit: z.string().min(1, "Unit is required"),
});

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  isSubtask: z.boolean().default(false),
  parentTemplateId: z.string().optional(),
});

type IngredientFormValues = z.infer<typeof ingredientSchema>;
type TaskFormValues = z.infer<typeof taskSchema>;

const Ingredients = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    ingredients,
    isLoading,
    error,
    getIngredientWithTasks,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    createTaskTemplate,
    deleteTaskTemplate,
  } = useIngredients();

  const form = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: "",
      description: "",
      stock: 0,
      pricePerUnit: 0,
      unit: "kg",
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

  const { data: ingredientWithTasks } = getIngredientWithTasks(selectedIngredient?.id || "");

  const onSubmit = (values: IngredientFormValues) => {
    if (isEditing && selectedIngredient) {
      updateIngredient({
        id: selectedIngredient.id,
        ...values,
      });
    } else {
      createIngredient({
        name: values.name,
        description: values.description,
        stock: values.stock,
        pricePerUnit: values.pricePerUnit,
        unit: values.unit,
      });
    }
    setOpenDialog(false);
    resetForm();
  };

  const onSubmitTask = (values: TaskFormValues) => {
    if (selectedIngredient) {
      createTaskTemplate({
        title: values.title,
        description: values.description,
        priority: values.priority as TaskPriority,
        isSubtask: values.isSubtask,
        parentTemplateId: values.parentTemplateId,
        ingredientId: selectedIngredient.id,
        productId: undefined,
      });
    }
    setOpenTaskDialog(false);
    taskForm.reset();
  };

  const resetForm = () => {
    form.reset();
    setIsEditing(false);
    setSelectedIngredient(null);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsEditing(true);
    
    form.reset({
      name: ingredient.name,
      description: ingredient.description || "",
      stock: ingredient.stock,
      pricePerUnit: ingredient.pricePerUnit,
      unit: ingredient.unit,
    });
    
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this ingredient?")) {
      deleteIngredient(id);
    }
  };

  const handleAddTask = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
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
          <h1 className="text-2xl font-bold">Ingredients</h1>
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
          <h1 className="text-2xl font-bold">Ingredients</h1>
          <p className="text-red-500">Error loading ingredients</p>
        </div>
      </div>
    );
  }

  const unitOptions: IngredientUnit[] = ["kg", "g", "l", "ml", "piece", "box", "batch"];

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Ingredients</h1>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setOpenDialog(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Ingredient" : "Add New Ingredient"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? "Update the ingredient details below"
                    : "Fill in the details for the new ingredient"}
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
                          <Input placeholder="Enter ingredient name" {...field} />
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
                      name="pricePerUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price Per Unit</FormLabel>
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
                  </div>

                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            {...field}
                          >
                            {unitOptions.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit">
                      {isEditing ? "Update Ingredient" : "Add Ingredient"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ingredients.map((ingredient) => (
            <Card key={ingredient.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-start">
                  <span>{ingredient.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(ingredient)}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(ingredient.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  {ingredient.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Stock:</span>
                    <span className="font-medium">
                      {ingredient.stock} {ingredient.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per Unit:</span>
                    <span className="font-medium">
                      ${ingredient.pricePerUnit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedIngredient(ingredient)}
                    >
                      View Tasks
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[800px] w-full">
                    <DialogHeader>
                      <DialogTitle>Tasks for {ingredient.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Predefined Tasks</h3>
                        <Button
                          size="sm"
                          onClick={() => handleAddTask(ingredient)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Task
                        </Button>
                      </div>
                      {ingredientWithTasks?.tasks?.length ? (
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
                            {ingredientWithTasks.tasks.map((task) => (
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
                          No tasks defined for this ingredient.
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleAddTask(ingredient)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {ingredients.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              No ingredients found. Click "Add Ingredient" to create one.
            </p>
          </div>
        )}
      </div>

      {/* Task Dialog */}
      <Dialog open={openTaskDialog} onOpenChange={setOpenTaskDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>
              Create a task template for {selectedIngredient?.name}
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

              {taskForm.watch("isSubtask") && ingredientWithTasks?.tasks?.filter(t => !t.isSubtask).length > 0 && (
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
                          {ingredientWithTasks?.tasks
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

export default Ingredients;
