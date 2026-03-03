
import PrintJobForm from "@/components/PrintJobForm";
import PrintJobsList from "@/components/PrintJobsList";

const Print = () => {
  return (
    <div className="bg-background flex flex-col flex-grow">
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Pusat Cetak</h2>
          <p className="text-muted-foreground">Buat pekerjaan cetak baru dan kelola antrian pencetakan Anda</p>
        </div>
        
        <PrintJobForm />
        <PrintJobsList />
      </main>
    </div>
  );
};

export default Print;
