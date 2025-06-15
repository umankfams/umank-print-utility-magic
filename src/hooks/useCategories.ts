
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Category = Tables<"categories">;
export type CategoryInsert = TablesInsert<"categories">;
export type CategoryUpdate = TablesUpdate<"categories">;

export function useCategories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories from Supabase
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('Fetching categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      console.log('Fetched categories:', data);
      return data as Category[];
    }
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (newCategory: Omit<CategoryInsert, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('categories')
        .insert(newCategory)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Berhasil",
        description: "Kategori berhasil ditambahkan"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal menambahkan kategori",
        variant: "destructive"
      });
      console.error('Error adding category:', error);
    }
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Omit<CategoryUpdate, 'id' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Berhasil",
        description: "Kategori berhasil diperbarui"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal memperbarui kategori",
        variant: "destructive"
      });
      console.error('Error updating category:', error);
    }
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Berhasil",
        description: "Kategori berhasil dihapus"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal menghapus kategori",
        variant: "destructive"
      });
      console.error('Error deleting category:', error);
    }
  });

  const addCategory = (newCategory: Omit<CategoryInsert, 'id' | 'created_at' | 'updated_at'>) => {
    addCategoryMutation.mutate(newCategory);
  };

  const updateCategory = (id: string, updatedCategory: Omit<CategoryUpdate, 'id' | 'updated_at'>) => {
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
