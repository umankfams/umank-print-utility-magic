
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import PrintJobForm from "@/components/PrintJobForm";
import PrintJobsList from "@/components/PrintJobsList";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Print Dashboard</h2>
          <Button>New Print Job</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 space-y-6">
            <PrintJobForm />
          </div>
          
          <div className="md:col-span-7 space-y-6">
            <PrintJobsList />
          </div>
        </div>
      </main>
      
      <footer className="bg-muted py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Print Utility Magic | All Rights Reserved
        </div>
      </footer>
    </div>
  );
};

export default Index;
