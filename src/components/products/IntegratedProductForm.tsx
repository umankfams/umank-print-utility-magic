
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Product, Ingredient, ProductIngredient } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";

interface IntegratedProductFormProps {
  isEditing: boolean;
  selectedProduct: Product | null;
  ingredients: Ingredient[];
  productIngredients: ProductIngredient[];
  onSubmit: (values: any) => void;
  onAddIngredient: (values: any) => void;
  onRemoveIngredient: (id: string, productId: string) => void;
}

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  stock: z.number().nonnegative("Stock must be a positive number").default(0),
  minOrder: z.number().positive("Minimum order must be greater than 0").default(1),
  markupPercentage: z.number().min(0, "Markup percentage must be positive").default(30),
});

const ingredientSchema = z.object({
  ingredientId: z.string().min(1, "Ingredient is required"),
  quantity: z.number().positive("Quantity must be greater than 0").default(1),
});

// Helper function to consolidate ingredients
const consolidateIngredients = (productIngredients: ProductIngredient[]): ProductIngredient[] => {
  const consolidatedMap = new Map<string, ProductIngredient>();
  
  productIngredients.forEach(item => {
    if (!item.ingredient) return;
    
    const key = item.ingredient.id;
    if (consolidatedMap.has(key)) {
      // Increase quantity of existing entry
      const existing = consolidatedMap.get(key)!;
      consolidatedMap.set(key, {
        ...existing,
        quantity: existing.quantity + item.quantity
      });
    } else {
      // Add new entry
      consolidatedMap.set(key, {...item});
    }
  });
  
  return Array.from(consolidatedMap.values());
};

export function IntegratedProductForm({
  isEditing,
  selectedProduct,
  ingredients,
  productIngredients,
  onSubmit,
  onAddIngredient,
  onRemoveIngredient,
}: IntegratedProductFormProps) {
  const [selectedIngredientPrice, setSelectedIngredientPrice] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [isIngredientFormVisible, setIsIngredientFormVisible] = useState<boolean>(false);

  // Main product form
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: selectedProduct?.name || "",
      description: selectedProduct?.description || "",
      stock: selectedProduct?.stock || 0,
      minOrder: selectedProduct?.minOrder || 1,
      markupPercentage: selectedProduct?.costPrice 
        ? Math.round(((selectedProduct.sellingPrice - selectedProduct.costPrice) / selectedProduct.costPrice) * 100) 
        : 30,
    },
  });

  // Ingredient form
  const ingredientForm = useForm<z.infer<typeof ingredientSchema>>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      ingredientId: "",
      quantity: 1,
    },
  });

  // Convert productIngredients to a more usable format and consolidate identical ingredients
  const consolidatedIngredients = consolidateIngredients(productIngredients);

  // Update total cost when ingredients change
  useEffect(() => {
    if (selectedProduct) {
      setTotalCost(selectedProduct.costPrice);
    } else {
      const total = consolidatedIngredients.reduce((sum, item) => {
        if (!item.ingredient) return sum;
        return sum + (item.quantity * item.ingredient.pricePerUnit);
      }, 0);
      setTotalCost(total);
    }
  }, [selectedProduct, consolidatedIngredients]);

  // Handle ingredient selection change
  const handleIngredientChange = (value: string) => {
    const ingredient = ingredients.find(i => i.id === value);
    if (ingredient) {
      setSelectedIngredientPrice(ingredient.pricePerUnit);
    } else {
      setSelectedIngredientPrice(0);
    }
  };

  // Handle adding ingredient
  const handleAddIngredient = (values: z.infer<typeof ingredientSchema>) => {
    onAddIngredient(values);
    ingredientForm.reset();
    setIsIngredientFormVisible(false);
  };

  // Calculate markup preview
  const calculatePreviewPrice = () => {
    const markup = form.watch("markupPercentage");
    return totalCost * (1 + markup / 100);
  };

  return (
    <div className="space-y-4">
      {/* Product Form */}
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
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
                  <Textarea placeholder="Enter product description" {...field} />
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
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Price information */}
          <div className="bg-muted p-4 rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Cost Price</p>
                <p className="text-lg font-bold">{formatCurrency(totalCost)}</p>
                <p className="text-xs text-muted-foreground">Based on ingredients</p>
              </div>

              <FormField
                control={form.control}
                name="markupPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Markup (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-2">
              <p className="text-sm font-medium">Selling Price Preview</p>
              <p className="text-lg font-bold">{formatCurrency(calculatePreviewPrice())}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">{isEditing ? "Update Product" : "Create Product"}</Button>
          </div>
        </form>
      </Form>

      <Separator className="my-4" />

      {/* Ingredients Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Ingredients</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setIsIngredientFormVisible(!isIngredientFormVisible)}
          >
            {isIngredientFormVisible ? "Cancel" : "Add Ingredient"}
          </Button>
        </div>

        {/* Ingredient Form */}
        {isIngredientFormVisible && (
          <Form {...ingredientForm}>
            <form className="space-y-4 bg-muted p-4 rounded-md mb-4" onSubmit={ingredientForm.handleSubmit(handleAddIngredient)}>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={ingredientForm.control}
                  name="ingredientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ingredient</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleIngredientChange(value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ingredient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ingredients.map((ingredient) => (
                            <SelectItem key={ingredient.id} value={ingredient.id}>
                              {ingredient.name} - {formatCurrency(ingredient.pricePerUnit)}/{ingredient.unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="text-sm">
                <span>Price: {formatCurrency(selectedIngredientPrice)} × Quantity</span>
              </div>

              <Button type="submit" size="sm">Add to Recipe</Button>
            </form>
          </Form>
        )}

        {/* Ingredients List */}
        {consolidatedIngredients.length > 0 ? (
          <div className="border rounded-md divide-y">
            {consolidatedIngredients.map((item) => (
              item.ingredient && (
                <div key={item.id} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.ingredient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} {item.ingredient.unit} × {formatCurrency(item.ingredient.pricePerUnit)} = {formatCurrency(item.quantity * item.ingredient.pricePerUnit)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveIngredient(item.id, item.productId)}
                  >
                    Remove
                  </Button>
                </div>
              )
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">No ingredients added yet.</p>
        )}
      </div>
    </div>
  );
};
