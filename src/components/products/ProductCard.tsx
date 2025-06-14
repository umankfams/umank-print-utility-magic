
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
import { Edit as EditIcon, Trash as TrashIcon, FileText } from "lucide-react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onViewIngredients: (product: Product) => void; // Kept for backward compatibility
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(product)}
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit produk</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(product.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hapus produk</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardTitle>
        <CardDescription>
          {product.description || "Tidak ada deskripsi"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Harga Pokok:</span>
            <span className="font-medium">
              {formatCurrency(product.costPrice)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Harga Jual:</span>
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
            <span>Stok:</span>
            <span className="font-medium">
              {product.stock === 0 ? (
                <Badge variant="destructive">Habis</Badge>
              ) : product.stock < product.minOrder ? (
                <Badge variant="warning">Stok Rendah</Badge>
              ) : (
                `${product.stock} unit`
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Pesanan Min:</span>
            <span className="font-medium">
              {product.minOrder} unit
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={() => onViewTasks(product)}
              >
                <FileText className="h-4 w-4 mr-2" /> Lihat Tugas
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Lihat tugas untuk produk ini</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};
