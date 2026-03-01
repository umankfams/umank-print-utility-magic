
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Category {
  id: string;
  key: string;
  label: string;
  icon: string;
  color: string;
  type: string;
  created_at: string;
}

export function useCategories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['finance_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('finance_categories')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Category[];
    }
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (newCategory: Omit<Category, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('finance_categories')
        .insert(newCategory)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance_categories'] });
      toast({ title: "Berhasil", description: "Kategori berhasil ditambahkan" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menambahkan kategori", variant: "destructive" });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<Omit<Category, 'id' | 'created_at'>>) => {
      const { data, error } = await supabase
        .from('finance_categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance_categories'] });
      toast({ title: "Berhasil", description: "Kategori berhasil diperbarui" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal memperbarui kategori", variant: "destructive" });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('finance_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance_categories'] });
      toast({ title: "Berhasil", description: "Kategori berhasil dihapus" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menghapus kategori", variant: "destructive" });
    }
  });

  const addCategory = (newCategory: Omit<Category, 'id' | 'created_at'>) => {
    addCategoryMutation.mutate(newCategory);
  };

  const updateCategory = (id: string, updatedCategory: Partial<Omit<Category, 'id' | 'created_at'>>) => {
    updateCategoryMutation.mutate({ id, ...updatedCategory });
  };

  const deleteCategory = (id: string) => {
    deleteCategoryMutation.mutate(id);
  };

  return {
    categories,
    isLoading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
