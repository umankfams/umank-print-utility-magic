
import { useState, useEffect } from "react";
import { ProductCategory } from "@/hooks/useProductCategories";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CategoryFormProps {
  category?: ProductCategory;
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: { key: string; label: string; icon: string; color: string }) => void;
}

const colors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#64748B', '#0EA5E9', '#22C55E', '#6B7280'
];

const icons = [
  'Card', 'File', 'Image', 'Tag', 'Calendar', 
  'Folder', 'Clipboard', 'Book', 'Printer'
];

export function CategoryForm({ category, isOpen, onClose, onSave }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    icon: 'Folder',
    color: '#3B82F6'
  });

  useEffect(() => {
    if (category) {
      setFormData({
        key: category.key,
        label: category.label,
        icon: category.icon,
        color: category.color
      });
    } else {
      setFormData({
        key: '',
        label: '',
        icon: 'Folder',
        color: '#3B82F6'
      });
    }
  }, [category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.key || !formData.label) {
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? 'Edit Kategori' : 'Tambah Kategori Baru'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="key">Kunci</Label>
            <Input
              id="key"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              placeholder="contoh: kartu-nama"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="label">Nama Kategori</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="contoh: Kartu Nama"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="icon">Ikon</Label>
            <select
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              {icons.map(icon => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
          </div>
          
          <div>
            <Label htmlFor="color">Warna</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">
              {category ? 'Perbarui' : 'Tambah'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
