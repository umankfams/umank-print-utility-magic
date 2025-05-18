
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { Customer } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useCustomers = () => {
  const queryClient = useQueryClient();
  
  // Get all customers from Supabase
  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return data.map(customer => ({
        ...customer,
        id: customer.id,
        createdAt: new Date(customer.created_at),
        updatedAt: new Date(customer.updated_at)
      })) as Customer[];
    }
  });
  
  // Create customer
  const createCustomer = useMutation({
    mutationFn: async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          contact: customer.contact,
          address: customer.address
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        id: data.id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
  
  // Update customer
  const updateCustomer = useMutation({
    mutationFn: async (customer: Partial<Customer> & { id: string }) => {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: customer.name,
          contact: customer.contact,
          address: customer.address
        })
        .eq('id', customer.id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        id: data.id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
  
  // Delete customer
  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
  
  return {
    customers,
    isLoading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
};
