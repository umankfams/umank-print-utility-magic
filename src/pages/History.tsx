
import Header from "@/components/Header";
import PrintHistory from "@/components/PrintHistory";

const History = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Riwayat Cetak</h2>
          <p className="text-muted-foreground">Lihat semua pekerjaan cetak sebelumnya</p>
        </div>
        
        <PrintHistory />
      </main>
      
      <footer className="bg-muted py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Print Utility Magic | Hak Cipta Dilindungi
        </div>
      </footer>
    </div>
  );
};

export default History;
