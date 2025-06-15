
import { useState, useEffect } from "react";
import { Category } from "@/hooks/useCategories";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import * as LucideIcons from "lucide-react";

interface CategoryManagementFormProps {
  category?: Category;
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: { key: string; label: string; icon: string; color: string; type: 'expense' | 'income' }) => void;
  defaultType: 'expense' | 'income';
}

const colors = [
  '#F59E0B', '#3B82F6', '#EC4899', '#06B6D4', '#84CC16', 
  '#8B5CF6', '#EF4444', '#10B981', '#F97316', '#64748B'
];

const expenseIcons = [
  { name: 'Utensils', label: 'Makanan' },
  { name: 'Car', label: 'Transportasi' },
  { name: 'Home', label: 'Perumahan' },
  { name: 'Zap', label: 'Utilitas' },
  { name: 'Heart', label: 'Kesehatan' },
  { name: 'ShoppingBag', label: 'Belanja' },
  { name: 'GamepadIcon', label: 'Hiburan' },
  { name: 'BookOpen', label: 'Pendidikan' },
  { name: 'MoreHorizontal', label: 'Lainnya' }
];

const incomeIcons = [
  { name: 'Briefcase', label: 'Gaji' },
  { name: 'TrendingUp', label: 'Investasi' },
  { name: 'Gift', label: 'Bonus' },
  { name: 'PiggyBank', label: 'Tabungan' },
  { name: 'DollarSign', label: 'Bisnis' },
  { name: 'Award', label: 'Freelance' },
  { name: 'Coins', label: 'Dividen' },
  { name: 'MoreHorizontal', label: 'Lainnya' }
];

export function CategoryManagementForm({ 
  category, 
  isOpen, 
  onClose, 
  onSave, 
  defaultType 
}: CategoryManagementFormProps) {
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    icon: 'Folder',
    color: '#3B82F6',
    type: defaultType
  });

  useEffect(() => {
    if (category) {
      setFormData({
        key: category.key,
        label: category.label,
        icon: category.icon,
        color: category.color,
        type: category.type as 'expense' | 'income'
      });
    } else {
      setFormData({
        key: '',
        label: '',
        icon: 'Folder',
        color: '#3B82F6',
        type: defaultType
      });
    }
  }, [category, isOpen, defaultType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.key || !formData.label) {
      return;
    }

    onSave(formData);
    onClose();
  };

  const iconOptions = formData.type === 'expense' ? expenseIcons : incomeIcons;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Edit Kategori' : 'Tambah Kategori Baru'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Tipe Kategori</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value: 'expense' | 'income') => 
                setFormData({ ...formData, type: value })
              }
              className="flex space-x-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense">Pengeluaran</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income">Pemasukan</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="label">Nama Kategori</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="contoh: Makanan & Minuman"
              required
            />
          </div>

          <div>
            <Label htmlFor="key">Kunci</Label>
            <Input
              id="key"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              placeholder="contoh: makanan-minuman"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="icon">Ikon</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {iconOptions.map(({ name, label }) => {
                const IconComponent = (LucideIcons as any)[name] || LucideIcons.Folder;
                return (
                  <button
                    key={name}
                    type="button"
                    className={`p-3 rounded border-2 flex flex-col items-center justify-center space-y-1 transition-colors ${
                      formData.icon === name 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData({ ...formData, icon: name })}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-xs">{label}</span>
                  </button>
                );
              })}
            </div>
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
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
              {category ? 'Perbarui' : 'Tambah'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
