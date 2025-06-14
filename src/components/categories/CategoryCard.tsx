
import { ProductCategory } from "@/hooks/useProductCategories";
import { Card, CardContent } from "@/components/ui/card";
import * as LucideIcons from "lucide-react";

interface CategoryCardProps {
  category: ProductCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  // Get the icon component dynamically
  const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Folder;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6 text-center">
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
