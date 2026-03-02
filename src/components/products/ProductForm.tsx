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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus } from "lucide-react";
import { Product, Ingredient, ProductIngredient } from "@/types";
import { formatCurrency, calculateSellingPrice } from "@/lib/utils";
import { useProductCategories } from "@/hooks/useProductCategories";
import { useIngredients } from "@/hooks/useIngredients";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  markupPercentage: z.number().min(0, "Markup cannot be negative").max(300, "Markup cannot exceed 300%"),
  stock: z.number().min(0, "Stock cannot be negative"),
  minOrder: z.number().min(1, "Minimum order must be at least 1"),
});

const ingredientSchema = z.object({
  ingredientId: z.string().min(1, "Ingredient is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
});

type ProductFormValues = z.infer<typeof productSchema>;
type IngredientFormValues = z.infer<typeof ingredientSchema>;

// Local ingredient item used during form editing
export interface LocalIngredientItem {
  tempId: string; // temporary ID for local state
  dbId?: string; // actual DB id if already saved
  ingredientId: string;
  ingredient?: Ingredient;
  quantity: number;
}

export interface ProductFormSubmitData extends ProductFormValues {
  localIngredients: LocalIngredientItem[];
}

interface ProductFormProps {
  isEditing: boolean;
  selectedProduct: Product | null;
  productIngredients: ProductIngredient[];
  onSubmit: (values: ProductFormSubmitData) => void;
  onAddIngredient?: (values: IngredientFormValues) => void;
  onRemoveIngredient?: (id: string, productId: string) => void;
}

export const ProductForm = ({ 
  isEditing, 
  selectedProduct, 
  productIngredients,
  onSubmit,
}: ProductFormProps) => {
  const [calculatedCostPrice, setCalculatedCostPrice] = useState(0);
  const [calculatedSellingPrice, setCalculatedSellingPrice] = useState(0);
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [localIngredients, setLocalIngredients] = useState<LocalIngredientItem[]>([]);
  
  const { categories, isLoading: categoriesLoading } = useProductCategories();
  const { ingredients } = useIngredients();

  // Initialize local ingredients from existing product ingredients when editing
  useEffect(() => {
    if (isEditing && productIngredients && productIngredients.length > 0) {
      setLocalIngredients(productIngredients.map(pi => ({
        tempId: pi.id,
        dbId: pi.id,
        ingredientId: pi.ingredientId,
        ingredient: pi.ingredient,
        quantity: pi.quantity,
      })));
    } else if (!isEditing) {
      setLocalIngredients([]);
    }
  }, [isEditing, productIngredients]);

  const getInitialMarkupPercentage = () => {
    if (isEditing && selectedProduct && selectedProduct.costPrice > 0) {
      const markup = Math.round(((selectedProduct.sellingPrice - selectedProduct.costPrice) / selectedProduct.costPrice) * 100);
      return isNaN(markup) ? 30 : markup;
    }
    return 30;
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: selectedProduct?.name || "",
      description: selectedProduct?.description || "",
      categoryId: selectedProduct?.categoryId || "",
      markupPercentage: getInitialMarkupPercentage(),
      stock: selectedProduct?.stock || 0,
      minOrder: selectedProduct?.minOrder || 1,
    },
  });

  const ingredientForm = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      ingredientId: "",
      quantity: 1,
    },
  });

  const watchMarkupPercentage = form.watch("markupPercentage");

  // Calculate cost price from local ingredients
  useEffect(() => {
    if (localIngredients.length > 0) {
      const totalCost = localIngredients.reduce((sum, item) => {
        if (item.ingredient && !isNaN(item.ingredient.pricePerUnit) && !isNaN(item.quantity)) {
          return sum + (item.quantity * item.ingredient.pricePerUnit);
        }
        return sum;
      }, 0);
      setCalculatedCostPrice(totalCost);
    } else if (isEditing && selectedProduct && !isNaN(selectedProduct.costPrice)) {
      setCalculatedCostPrice(selectedProduct.costPrice);
    } else {
      setCalculatedCostPrice(0);
    }
  }, [localIngredients, selectedProduct, isEditing]);

  useEffect(() => {
    const markup = isNaN(watchMarkupPercentage) ? 30 : watchMarkupPercentage;
    const sellingPrice = calculateSellingPrice(calculatedCostPrice, markup);
    setCalculatedSellingPrice(isNaN(sellingPrice) ? 0 : sellingPrice);
  }, [watchMarkupPercentage, calculatedCostPrice]);

  const handleFormSubmit = (values: ProductFormValues) => {
    onSubmit({ ...values, localIngredients });
  };

  const handleAddLocalIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    ingredientForm.handleSubmit((values) => {
      const selectedIngredient = ingredients.find(i => i.id === values.ingredientId);
      if (!selectedIngredient) return;

      const newItem: LocalIngredientItem = {
        tempId: `temp-${Date.now()}`,
        ingredientId: values.ingredientId,
        ingredient: selectedIngredient,
        quantity: values.quantity,
      };
      setLocalIngredients(prev => [...prev, newItem]);
      ingredientForm.reset();
      setShowIngredientForm(false);
    })(e);
  };

  const handleRemoveLocalIngredient = (tempId: string) => {
    setLocalIngredients(prev => prev.filter(i => i.tempId !== tempId));
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                    ) : !categories || categories.length === 0 ? (
                      <SelectItem value="no-categories" disabled>No categories available</SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label || category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
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
                          e.target.value === "" ? 0 : parseFloat(e.target.value)
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
                          e.target.value === "" ? 1 : parseInt(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Ingredients Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Product Ingredients</h3>
              <Button 
                type="button"
                variant="outline" 
                size="sm" 
                onClick={() => setShowIngredientForm(!showIngredientForm)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </div>

            {/* Add Ingredient Form */}
            {showIngredientForm && (
              <Form {...ingredientForm}>
                <div className="bg-muted p-4 rounded-md space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={ingredientForm.control}
                      name="ingredientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ingredient</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ingredient" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ingredients.length === 0 ? (
                                <SelectItem value="no-ingredients" disabled>No ingredients available</SelectItem>
                              ) : (
                                ingredients.map((ingredient) => (
                                  <SelectItem key={ingredient.id} value={ingredient.id}>
                                    {ingredient.name} - {formatCurrency(ingredient.pricePerUnit)}/{ingredient.unit}
                                  </SelectItem>
                                ))
                              )}
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
                              placeholder="1"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === "" ? 0 : parseFloat(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={handleAddLocalIngredient}>Add Ingredient</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowIngredientForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Form>
            )}

            {/* Ingredients List */}
            {localIngredients.length > 0 ? (
              <div className="border rounded-md divide-y">
                {localIngredients.map((item) => (
                  <div key={item.tempId} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.ingredient?.name || 'Unknown Ingredient'}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.ingredient?.unit} × {formatCurrency(item.ingredient?.pricePerUnit || 0)} = {formatCurrency((item.ingredient?.pricePerUnit || 0) * item.quantity)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLocalIngredient(item.tempId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">No ingredients added yet.</p>
            )}
          </div>

          <Separator />

          {/* Pricing Section */}
          <div className="bg-muted p-4 rounded-md space-y-4">
            <div>
              <FormLabel>Cost Price (from ingredients)</FormLabel>
              <p className="text-lg font-bold">
                {formatCurrency(calculatedCostPrice)}
              </p>
              <p className="text-xs text-muted-foreground">
                Automatically calculated from ingredients
              </p>
            </div>

            <FormField
              control={form.control}
              name="markupPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Markup Percentage: {isNaN(field.value) ? 30 : field.value}%</FormLabel>
                  <FormControl>
                    <Slider
                      defaultValue={[isNaN(field.value) ? 30 : field.value]}
                      min={0}
                      max={300}
                      step={1}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Selling Price:</span>
              <span className="text-lg font-bold">
                {formatCurrency(calculatedSellingPrice)}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">
              {isEditing ? "Update Product" : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
};