
import Header from "@/components/Header";
import PrintSettings from "@/components/PrintSettings";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Pengaturan</h2>
          <p className="text-muted-foreground">Konfigurasi preferensi pencetakan Anda</p>
        </div>
        
        <PrintSettings />
      </main>
      
      <footer className="bg-muted py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Print Utility Magic | Hak Cipta Dilindungi
        </div>
      </footer>
    </div>
  );
};

export default Settings;
