
import { ProductCategory } from "@/hooks/useProductCategories";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as LucideIcons from "lucide-react";
import { Edit, Trash2 } from "lucide-react";

interface CategoryCardProps {
  category: ProductCategory;
  onEdit: (category: ProductCategory) => void;
  onDelete: (id: string) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  // Get the icon component dynamically
  const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Folder;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6 text-center relative">
        <div className="absolute top-2 right-2 flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(category)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(category.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <IconComponent 
            className="w-8 h-8" 
            style={{ color: category.color }}
          />
        </div>
        <h3 className="font-semibold text-lg mb-2">{category.label}</h3>
        <p className="text-sm text-gray-600">{category.key}</p>
      </CardContent>
    </Card>
  );
}
