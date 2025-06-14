
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
import { Product } from "@/types";
import { formatCurrency, calculateSellingPrice } from "@/lib/utils";
import { useProductCategories } from "@/hooks/useProductCategories";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  markupPercentage: z.number().min(0, "Markup cannot be negative").max(300, "Markup cannot exceed 300%"),
  stock: z.number().min(0, "Stock cannot be negative"),
  minOrder: z.number().min(1, "Minimum order must be at least 1"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  isEditing: boolean;
  selectedProduct: Product | null;
  onSubmit: (values: ProductFormValues) => void;
}

export const ProductForm = ({ isEditing, selectedProduct, onSubmit }: ProductFormProps) => {
  const [currentCostPrice, setCurrentCostPrice] = useState(0);
  const [calculatedSellingPrice, setCalculatedSellingPrice] = useState(0);
  const { categories, isLoading: categoriesLoading } = useProductCategories();

  console.log("Categories loaded:", categories);
  console.log("Categories loading:", categoriesLoading);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: selectedProduct?.name || "",
      description: selectedProduct?.description || "",
      categoryId: selectedProduct?.categoryId || "",
      markupPercentage: isEditing && selectedProduct
        ? Math.round(((selectedProduct.sellingPrice - selectedProduct.costPrice) / selectedProduct.costPrice) * 100)
        : 30,
      stock: selectedProduct?.stock || 0,
      minOrder: selectedProduct?.minOrder || 1,
    },
  });

  // Watch markup percentage changes from the form
  const watchMarkupPercentage = form.watch("markupPercentage");

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

  const handleFormSubmit = (values: ProductFormValues) => {
    console.log("Form submitted with values:", values);
    onSubmit(values);
  };

  return (
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
                    <SelectItem value="" disabled>Loading categories...</SelectItem>
                  ) : categories.length === 0 ? (
                    <SelectItem value="" disabled>No categories available</SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
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

        {isEditing && selectedProduct && (
          <div className="mb-4">
            <FormLabel>Cost Price</FormLabel>
            <p className="text-md font-medium">
              {formatCurrency(selectedProduct.costPrice)}
            </p>
            <p className="text-xs text-muted-foreground">
              Cost price is calculated from ingredients
            </p>
          </div>
        )}

        <FormField
          control={form.control}
          name="markupPercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Markup Percentage: {field.value}%</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    defaultValue={[field.value]}
                    min={0}
                    max={300}
                    step={1}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </div>
              </FormControl>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">Selling Price:</span>
                <span className="text-md font-medium">
                  {formatCurrency(calculatedSellingPrice)}
                </span>
              </div>
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
  );
};
