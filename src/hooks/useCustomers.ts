
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { Customer } from "@/types";

// Sample customer data
const sampleCustomers: Customer[] = [
  { id: "1", name: "PT Makmur Sejahtera", contact: "+62812345678", address: "Jl. Sudirman No. 123, Jakarta", createdAt: new Date(), updatedAt: new Date() },
  { id: "2", name: "CV Bahagia Jaya", contact: "+62823456789", address: "Jl. Thamrin No. 456, Jakarta", createdAt: new Date(), updatedAt: new Date() },
  { id: "3", name: "UD Sinar Terang", contact: "+62834567890", address: "Jl. Gajah Mada No. 789, Surabaya", createdAt: new Date(), updatedAt: new Date() },
  { id: "4", name: "PT Maju Bersama", contact: "+62845678901", address: "Jl. Diponegoro No. 101, Bandung", createdAt: new Date(), updatedAt: new Date() },
  { id: "5", name: "Toko Berkah Abadi", contact: "+62856789012", address: "Jl. Ahmad Yani No. 202, Semarang", createdAt: new Date(), updatedAt: new Date() },
  { id: "6", name: "PT Indo Teknologi", contact: "+62867890123", address: "Jl. Pemuda No. 303, Yogyakarta", createdAt: new Date(), updatedAt: new Date() },
  { id: "7", name: "CV Damai Sentosa", contact: "+62878901234", address: "Jl. Pahlawan No. 404, Surakarta", createdAt: new Date(), updatedAt: new Date() },
  { id: "8", name: "UD Makmur Abadi", contact: "+62889012345", address: "Jl. Veteran No. 505, Malang", createdAt: new Date(), updatedAt: new Date() },
  { id: "9", name: "PT Jaya Makmur", contact: "+62890123456", address: "Jl. Merdeka No. 606, Denpasar", createdAt: new Date(), updatedAt: new Date() },
  { id: "10", name: "Toko Sejahtera", contact: "+62901234567", address: "Jl. Gatot Subroto No. 707, Medan", createdAt: new Date(), updatedAt: new Date() }
];

export const useCustomers = () => {
  const queryClient = useQueryClient();
  
  // Get all customers
  const { data: customers = sampleCustomers, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      // In a real app, this would fetch from an API
      return sampleCustomers;
    }
  });
  
  // Create customer
  const createCustomer = useMutation({
    mutationFn: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newCustomer: Customer = {
        ...customer,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // In a real app, this would send to an API
      sampleCustomers.push(newCustomer);
      return Promise.resolve(newCustomer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
  
  // Update customer
  const updateCustomer = useMutation({
    mutationFn: (customer: Partial<Customer> & { id: string }) => {
      const index = sampleCustomers.findIndex(c => c.id === customer.id);
      if (index !== -1) {
        sampleCustomers[index] = {
          ...sampleCustomers[index],
          ...customer,
          updatedAt: new Date()
        };
      }
      
      // In a real app, this would send to an API
      return Promise.resolve(sampleCustomers[index]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
  
  // Delete customer
  const deleteCustomer = useMutation({
    mutationFn: (id: string) => {
      const index = sampleCustomers.findIndex(c => c.id === id);
      if (index !== -1) {
        sampleCustomers.splice(index, 1);
      }
      
      // In a real app, this would send to an API
      return Promise.resolve(id);
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
