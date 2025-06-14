
import Header from "@/components/Header";
import PrintJobForm from "@/components/PrintJobForm";
import PrintJobsList from "@/components/PrintJobsList";

const Print = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Pusat Cetak</h2>
          <p className="text-muted-foreground">Buat pekerjaan cetak baru dan kelola antrian pencetakan Anda</p>
        </div>
        
        <PrintJobForm />
        <PrintJobsList />
      </main>
      
      <footer className="bg-muted py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Print Utility Magic | Hak Cipta Dilindungi
        </div>
      </footer>
    </div>
  );
};

export default Print;
