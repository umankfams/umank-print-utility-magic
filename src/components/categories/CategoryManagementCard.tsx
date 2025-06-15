
import { Category } from "@/hooks/useCategories";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as LucideIcons from "lucide-react";
import { Edit, Trash2 } from "lucide-react";

interface CategoryManagementCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryManagementCard({ category, onEdit, onDelete }: CategoryManagementCardProps) {
  // Get the icon component dynamically, with fallback to Folder
  const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Folder;

  const handleDelete = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      onDelete(category.id);
    }
  };

  return (
    <Card className="bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-6 relative">
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
            onClick={handleDelete}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: category.color }}
          >
            <IconComponent 
              className="w-6 h-6 text-white" 
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{category.label}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm text-gray-600">{category.key}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
