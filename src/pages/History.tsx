
import PrintHistory from "@/components/PrintHistory";

const History = () => {
  return (
    <div className="bg-background flex flex-col flex-grow">
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Riwayat Cetak</h2>
          <p className="text-muted-foreground">Lihat semua pekerjaan cetak sebelumnya</p>
        </div>
        
        <PrintHistory />
      </main>
    </div>
  );
};

export default History;
