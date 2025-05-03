
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
import { Trash as TrashIcon, Plus } from "lucide-react";
import { Product, Ingredient, ProductIngredient } from "@/types";
import { formatCurrency } from "@/lib/utils";

const ingredientSchema = z.object({
  ingredientId: z.string().min(1, "Ingredient is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
});

type IngredientFormValues = z.infer<typeof ingredientSchema>;

interface IngredientDialogProps {
  product: Product;
  ingredients: Ingredient[];
  productIngredients: ProductIngredient[];
  onAddIngredient: (values: IngredientFormValues) => void;
  onRemoveIngredient: (id: string, productId: string) => void;
}

export const IngredientDialog = ({
  product,
  ingredients,
  productIngredients,
  onAddIngredient,
  onRemoveIngredient,
}: IngredientDialogProps) => {
  const form = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      ingredientId: "",
      quantity: 1,
    },
  });

  const onSubmit = (values: IngredientFormValues) => {
    onAddIngredient(values);
    form.reset();
  };

  return (
    <DialogContent className="max-w-[800px] w-full">
      <DialogHeader>
        <DialogTitle>Ingredients for {product.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Product Ingredients</h3>
          <Button size="sm" onClick={() => form.reset()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Ingredient
          </Button>
        </div>

        {productIngredients.length ? (
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
              {productIngredients.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.ingredient?.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.ingredient?.unit}</TableCell>
                  <TableCell>
                    {formatCurrency(
                      (item.ingredient?.pricePerUnit || 0) *
                      item.quantity
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveIngredient(item.id, product.id)}
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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
                          {ingredient.name} ({formatCurrency(ingredient.pricePerUnit)} per {ingredient.unit})
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
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
      </div>
    </DialogContent>
  );
};
