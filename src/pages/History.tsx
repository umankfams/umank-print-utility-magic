
import Header from "@/components/Header";
import PrintHistory from "@/components/PrintHistory";

const History = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Print History</h2>
          <p className="text-muted-foreground">View all your previous print jobs</p>
        </div>
        
        <PrintHistory />
      </main>
      
      <footer className="bg-muted py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Print Utility Magic | All Rights Reserved
        </div>
      </footer>
    </div>
  );
};

export default History;
