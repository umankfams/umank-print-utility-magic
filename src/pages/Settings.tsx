
import PrintSettings from "@/components/PrintSettings";

const Settings = () => {
  return (
    <div className="bg-background flex flex-col flex-grow">
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Pengaturan</h2>
          <p className="text-muted-foreground">Konfigurasi preferensi pencetakan Anda</p>
        </div>
        
        <PrintSettings />
      </main>
    </div>
  );
};

export default Settings;
