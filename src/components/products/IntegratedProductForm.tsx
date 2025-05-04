
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product, Ingredient, ProductIngredient, TaskPriority } from "@/types";
import { formatCurrency, calculateSellingPrice } from "@/lib/utils";
import { Plus, Trash } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Form schema for product details
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  markupPercentage: z.number().min(0, "Markup cannot be negative").max(300, "Markup cannot exceed 300%"),
  stock: z.number().min(0, "Stock cannot be negative"),
  minOrder: z.number().min(1, "Minimum order must be at least 1"),
});

// Form schema for adding ingredients
const ingredientSchema = z.object({
  ingredientId: z.string().min(1, "Ingredient is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
});

type ProductFormValues = z.infer<typeof productSchema>;
type IngredientFormValues = z.infer<typeof ingredientSchema>;

interface IntegratedProductFormProps {
  isEditing: boolean;
  selectedProduct: Product | null;
  ingredients: Ingredient[];
  productIngredients: ProductIngredient[];
  onSubmit: (values: ProductFormValues) => void;
  onAddIngredient: (values: IngredientFormValues) => void;
  onRemoveIngredient: (id: string, productId: string) => void;
}

export const IntegratedProductForm = ({
  isEditing,
  selectedProduct,
  ingredients,
  productIngredients,
  onSubmit,
  onAddIngredient,
  onRemoveIngredient,
}: IntegratedProductFormProps) => {
  const [currentCostPrice, setCurrentCostPrice] = useState(0);
  const [calculatedSellingPrice, setCalculatedSellingPrice] = useState(0);
  const [activeTab, setActiveTab] = useState("details");

  // Product details form
  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: selectedProduct?.name || "",
      description: selectedProduct?.description || "",
      markupPercentage: isEditing && selectedProduct
        ? Math.round(((selectedProduct.sellingPrice - selectedProduct.costPrice) / selectedProduct.costPrice) * 100) || 30
        : 30,
      stock: selectedProduct?.stock || 0,
      minOrder: selectedProduct?.minOrder || 1,
    },
  });

  // Ingredient form
  const ingredientForm = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      ingredientId: "",
      quantity: 1,
    },
  });

  // Watch markup percentage changes from the form
  const watchMarkupPercentage = productForm.watch("markupPercentage");

  // Update calculated selling price when markup percentage or cost price changes
  useEffect(() => {
    if (isEditing && selectedProduct) {
      setCurrentCostPrice(selectedProduct.costPrice);
      const sellingPrice = calculateSellingPrice(selectedProduct.costPrice, watchMarkupPercentage);
      setCalculatedSellingPrice(sellingPrice);
    } else {
      setCalculatedSellingPrice(calculateSellingPrice(currentCostPrice, watchMarkupPercentage));
    }
  }, [watchMarkupPercentage, currentCostPrice, selectedProduct, isEditing]);

  const handleProductFormSubmit = (values: ProductFormValues) => {
    onSubmit(values);
  };

  const handleIngredientFormSubmit = (values: IngredientFormValues) => {
    console.log("Form values:", values);
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Please save the product before adding ingredients.",
        variant: "destructive",
      });
      return;
    }
    
    if (!values.ingredientId) {
      toast({
        title: "Error",
        description: "Please select an ingredient.",
        variant: "destructive",
      });
      return;
    }
    
    onAddIngredient(values);
    ingredientForm.reset({
      ingredientId: "",
      quantity: 1,
    });
  };

  // Calculate total ingredients cost
  const totalIngredientsCost = productIngredients.reduce((sum, item) => {
    if (!item.ingredient) return sum;
    return sum + (item.ingredient.pricePerUnit * item.quantity);
  }, 0);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Product Details</TabsTrigger>
          <TabsTrigger value="ingredients">
            Ingredients
            {productIngredients.length > 0 && (
              <span className="ml-2 rounded-full bg-primary w-6 h-6 flex items-center justify-center text-xs text-white">
                {productIngredients.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 pt-4">
          <Form {...productForm}>
            <form onSubmit={productForm.handleSubmit(handleProductFormSubmit)} className="space-y-4">
              <FormField
                control={productForm.control}
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
                control={productForm.control}
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
                  control={productForm.control}
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
                  control={productForm.control}
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

              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Cost Price (from ingredients):</span>
                  <span className="font-bold">
                    {formatCurrency(isEditing && selectedProduct ? selectedProduct.costPrice : totalIngredientsCost)}
                  </span>
                </div>

                <FormField
                  control={productForm.control}
                  name="markupPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between">
                        <FormLabel>Markup Percentage</FormLabel>
                        <span className="text-sm font-medium">{field.value}%</span>
                      </div>
                      <FormControl>
                        <Slider
                          defaultValue={[field.value]}
                          min={0}
                          max={300}
                          step={1}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="py-4"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Final Selling Price:</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(calculatedSellingPrice)}
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full">
                  {isEditing ? "Update Product" : "Add Product"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="ingredients" className="space-y-6 pt-4">
          {productIngredients.length > 0 ? (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productIngredients.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.ingredient?.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.ingredient?.unit}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency((item.ingredient?.pricePerUnit || 0) * item.quantity)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => selectedProduct && onRemoveIngredient(item.id, selectedProduct.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-semibold">Total Cost:</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(totalIngredientsCost)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg bg-muted/30">
              <p className="text-muted-foreground">
                No ingredients added to this product yet.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Add ingredients below to calculate the product cost.
              </p>
            </div>
          )}

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Add Ingredient</h3>
            <Form {...ingredientForm}>
              <form onSubmit={ingredientForm.handleSubmit(handleIngredientFormSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            value={field.value}
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
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full flex items-center">
                  <Plus className="h-4 w-4 mr-2" /> Add Ingredient
                </Button>
              </form>
            </Form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
