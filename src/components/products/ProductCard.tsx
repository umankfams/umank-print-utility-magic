
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Edit as EditIcon, Trash as TrashIcon } from "lucide-react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onViewIngredients: (product: Product) => void;
  onViewTasks: (product: Product) => void;
}

export const ProductCard = ({ 
  product, 
  onEdit, 
  onDelete, 
  onViewIngredients, 
  onViewTasks 
}: ProductCardProps) => {
  return (
    <Card key={product.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-start">
          <span>{product.name}</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(product)}
            >
              <EditIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(product.id)}
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
              {formatCurrency(product.costPrice)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Selling Price:</span>
            <span className="font-medium">
              {formatCurrency(product.sellingPrice)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Markup:</span>
            <span className="font-medium">
              {product.costPrice > 0 
                ? Math.round(((product.sellingPrice - product.costPrice) / product.costPrice) * 100)
                : 0}%
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
              onClick={() => onViewIngredients(product)}
            >
              Ingredients
            </Button>
          </DialogTrigger>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewTasks(product)}
            >
              Tasks
            </Button>
          </DialogTrigger>
        </Dialog>
      </CardFooter>
    </Card>
  );
};
