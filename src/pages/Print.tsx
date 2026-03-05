
import { useState } from "react";
import PrintJobForm from "@/components/PrintJobForm";
import PrintJobsList from "@/components/PrintJobsList";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

const Print = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-background flex flex-col flex-grow">
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Pusat Cetak</h2>
            <p className="text-muted-foreground">Buat pekerjaan cetak baru dan kelola antrian pencetakan Anda</p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambahkan Antrian Cetak
          </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Print Job</DialogTitle>
            </DialogHeader>
            <PrintJobForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>

        <PrintJobsList />
      </main>
    </div>
  );
};

export default Print;
