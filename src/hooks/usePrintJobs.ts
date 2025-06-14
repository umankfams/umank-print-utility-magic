
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PrintJob, PrintJobStatus } from "@/types";
import { toast } from "@/hooks/use-toast";

export function usePrintJobs() {
  const queryClient = useQueryClient();

  const fetchPrintJobs = async (): Promise<PrintJob[]> => {
    const { data, error } = await supabase
      .from("print_jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching print jobs:", error);
      throw new Error(error.message);
    }

    // Convert database rows to PrintJob type
    return data.map(item => ({
      id: item.id,
      name: item.name,
      fileUrl: item.file_url,
      fileName: item.file_name,
      status: item.status as PrintJobStatus,
      pages: item.pages,
      copies: item.copies,
      color: item.color,
      doubleSided: item.double_sided,
      createdAt: new Date(item.created_at),
    }));
  };

  const createPrintJob = async (printJob: Omit<PrintJob, "id" | "createdAt">): Promise<PrintJob> => {
    const { data, error } = await supabase
      .from("print_jobs")
      .insert({
        name: printJob.name,
        file_url: printJob.fileUrl,
        file_name: printJob.fileName,
        status: printJob.status,
        pages: printJob.pages,
        copies: printJob.copies,
        color: printJob.color,
        double_sided: printJob.doubleSided
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating print job:", error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      fileUrl: data.file_url,
      fileName: data.file_name,
      status: data.status as PrintJobStatus,
      pages: data.pages,
      copies: data.copies,
      color: data.color,
      doubleSided: data.double_sided,
      createdAt: new Date(data.created_at),
    };
  };

  const updatePrintJob = async (printJob: Partial<PrintJob> & { id: string }): Promise<PrintJob> => {
    const { data, error } = await supabase
      .from("print_jobs")
      .update({
        name: printJob.name,
        file_url: printJob.fileUrl,
        file_name: printJob.fileName,
        status: printJob.status,
        pages: printJob.pages,
        copies: printJob.copies,
        color: printJob.color,
        double_sided: printJob.doubleSided,
        updated_at: new Date().toISOString()
      })
      .eq("id", printJob.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating print job:", error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      fileUrl: data.file_url,
      fileName: data.file_name,
      status: data.status as PrintJobStatus,
      pages: data.pages,
      copies: data.copies,
      color: data.color,
      doubleSided: data.double_sided,
      createdAt: new Date(data.created_at),
    };
  };

  const deletePrintJob = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("print_jobs")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting print job:", error);
      throw new Error(error.message);
    }
  };

  // Define queries and mutations
  const printJobsQuery = useQuery({
    queryKey: ["printJobs"],
    queryFn: fetchPrintJobs
  });

  const createPrintJobMutation = useMutation({
    mutationFn: createPrintJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["printJobs"] });
      toast({
        title: "Print Job Created",
        description: "New print job has been created successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updatePrintJobMutation = useMutation({
    mutationFn: updatePrintJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["printJobs"] });
      toast({
        title: "Print Job Updated",
        description: "Print job has been updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deletePrintJobMutation = useMutation({
    mutationFn: deletePrintJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["printJobs"] });
      toast({
        title: "Print Job Deleted",
        description: "Print job has been deleted successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    printJobs: printJobsQuery.data || [],
    isLoading: printJobsQuery.isLoading,
    error: printJobsQuery.error,
    createPrintJob: createPrintJobMutation.mutate,
    updatePrintJob: updatePrintJobMutation.mutate,
    deletePrintJob: deletePrintJobMutation.mutate
  };
}
