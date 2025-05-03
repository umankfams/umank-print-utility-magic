
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
import { Product } from "@/types";
import { formatCurrency, calculateSellingPrice } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
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

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: selectedProduct?.name || "",
      description: selectedProduct?.description || "",
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
