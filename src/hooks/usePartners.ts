import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Partner {
  id: string;
  companyName: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const usePartners = () => {
  const queryClient = useQueryClient();

  const { data: partners = [], isLoading, error } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("company_name");
      if (error) throw error;
      return (data || []).map((p) => ({
        id: p.id,
        companyName: p.company_name,
        email: p.email,
        phone: p.phone,
        isActive: p.is_active,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
      })) as Partner[];
    },
  });

  const createPartner = useMutation({
    mutationFn: async (partner: Omit<Partner, "id" | "createdAt" | "updatedAt">) => {
      const { data, error } = await supabase
        .from("partners")
        .insert({
          company_name: partner.companyName,
          email: partner.email || null,
          phone: partner.phone || null,
          is_active: partner.isActive,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partners"] }),
  });

  const updatePartner = useMutation({
    mutationFn: async (partner: Partial<Partner> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      if (partner.companyName !== undefined) updateData.company_name = partner.companyName;
      if (partner.email !== undefined) updateData.email = partner.email || null;
      if (partner.phone !== undefined) updateData.phone = partner.phone || null;
      if (partner.isActive !== undefined) updateData.is_active = partner.isActive;

      const { data, error } = await supabase
        .from("partners")
        .update(updateData)
        .eq("id", partner.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partners"] }),
  });

  const deletePartner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("partners").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partners"] }),
  });

  return { partners, isLoading, error, createPartner, updatePartner, deletePartner };
};
