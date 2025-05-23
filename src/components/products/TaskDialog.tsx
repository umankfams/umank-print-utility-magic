
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Trash as TrashIcon, Plus, ChefHat } from "lucide-react";
import { Product, TaskTemplate } from "@/types";
import { Badge } from "@/components/ui/badge";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  isSubtask: z.boolean().default(false),
  parentTemplateId: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskDialogProps {
  product: Product;
  tasks: TaskTemplate[];
  readonly?: boolean;
  onAddTask?: (values: TaskFormValues) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const TaskDialog = ({
  product,
  tasks,
  readonly = false,
  onAddTask,
  onDeleteTask,
}: TaskDialogProps) => {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      isSubtask: false,
      parentTemplateId: undefined,
    },
  });

  const onSubmit = (values: TaskFormValues) => {
    if (onAddTask) {
      onAddTask(values);
      form.reset();
    }
  };

  const isSubtask = form.watch("isSubtask");
  const mainTasks = tasks.filter(t => !t.isSubtask);
  
  // Separate tasks by source (ingredient vs product)
  const productTasks = tasks.filter(t => t.productId === product.id);
  const ingredientTasks = tasks.filter(t => t.ingredientId && !t.productId);

  return (
    <DialogContent className="max-w-[800px] w-full">
      <DialogHeader>
        <DialogTitle>Tasks for {product.name}</DialogTitle>
        {readonly && (
          <DialogDescription>
            These tasks are inherited from the product's ingredients
          </DialogDescription>
        )}
      </DialogHeader>
      <div className="space-y-4">
        {/* Product Tasks Section */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Product Tasks</h3>
          {!readonly && onAddTask && (
            <Button
              size="sm"
              onClick={() => form.reset()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>

        {productTasks.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Type</TableHead>
                {!readonly && onDeleteTask && (
                  <TableHead className="w-[100px]">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {productTasks.map((task) => (
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
                  {!readonly && onDeleteTask && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteTask(task.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">
            No product-specific tasks defined.
          </p>
        )}

        {/* Ingredient Tasks Section */}
        <div className="mt-8 pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <ChefHat className="h-5 w-5 mr-2 text-amber-600" />
              Ingredient Tasks
              <Badge variant="outline" className="ml-2">
                Inherited
              </Badge>
            </h3>
          </div>

          {ingredientTasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredientTasks.map((task) => (
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
                      {product.ingredients?.find(i => i.ingredientId === task.ingredientId)?.ingredient?.name || "Unknown"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">
              No tasks inherited from ingredients.
            </p>
          )}
        </div>

        {!readonly && onAddTask && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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

              {isSubtask && mainTasks.length > 0 && (
                <FormField
                  control={form.control}
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
                          {mainTasks.map((task) => (
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
        )}
      </div>
    </DialogContent>
  );
};
