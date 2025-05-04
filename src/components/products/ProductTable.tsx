
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Edit, Trash, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onViewTasks: (product: Product) => void;
}

export const ProductTable = ({
  products,
  onEdit,
  onDelete,
  onViewTasks,
}: ProductTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead className="text-right">Selling Price</TableHead>
            <TableHead className="text-right">Markup</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right">Min Order</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <p className="text-muted-foreground">
                  No products found. Click "Add Product" to create one.
                </p>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {product.description || "No description"}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(product.costPrice)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(product.sellingPrice)}
                </TableCell>
                <TableCell className="text-right">
                  {product.costPrice > 0 
                    ? Math.round(((product.sellingPrice - product.costPrice) / product.costPrice) * 100)
                    : 0}%
                </TableCell>
                <TableCell className="text-right">
                  {product.stock === 0 ? (
                    <Badge variant="destructive" className="ml-auto">Out of Stock</Badge>
                  ) : product.stock < product.minOrder ? (
                    <Badge variant="warning" className="ml-auto">Low Stock</Badge>
                  ) : (
                    product.stock
                  )}
                </TableCell>
                <TableCell className="text-right">{product.minOrder}</TableCell>
                <TableCell>
                  <div className="flex justify-center space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit product</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewTasks(product)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View tasks</p>
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
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete product</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
