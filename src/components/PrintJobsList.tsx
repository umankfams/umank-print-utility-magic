
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrintJob, PrintJobStatus } from "@/types";
import { Clock, Printer, CheckCircle, AlertCircle, RefreshCcw } from "lucide-react";

const mockPrintJobs: PrintJob[] = [
  {
    id: "1",
    name: "Laporan Kuartalan",
    fileName: "Laporan_Q2_2023.pdf",
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    status: "printing",
    pages: 24,
    copies: 2,
    color: true,
    doubleSided: true,
  },
  {
    id: "2",
    name: "Catatan Rapat",
    fileName: "Catatan_Rapat_05_02_2024.docx",
    createdAt: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
    status: "pending",
    pages: 3,
    copies: 1,
    color: false,
    doubleSided: true,
  },
  {
    id: "3",
    name: "Brosur Produk",
    fileName: "Brosur_Produk_2024.pdf",
    createdAt: new Date(Date.now() - 1000 * 60 * 35), // 35 minutes ago
    status: "completed",
    pages: 12,
    copies: 5,
    color: true,
    doubleSided: true,
  },
  {
    id: "4",
    name: "Dokumen Error",
    fileName: "file_rusak.pdf",
    createdAt: new Date(Date.now() - 1000 * 60 * 50), // 50 minutes ago
    status: "failed",
    pages: 0,
    copies: 1,
    color: true,
    doubleSided: false,
  },
];

const getStatusIcon = (status: PrintJobStatus) => {
  switch (status) {
    case "pending":
      return <Clock size={16} className="text-amber-500" />;
    case "printing":
      return <RefreshCcw size={16} className="text-blue-500 animate-spin" />;
    case "completed":
      return <CheckCircle size={16} className="text-green-500" />;
    case "failed":
      return <AlertCircle size={16} className="text-red-500" />;
    default:
      return <Clock size={16} />;
  }
};

const getStatusBadge = (status: PrintJobStatus) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Menunggu</Badge>;
    case "printing":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Mencetak</Badge>;
    case "completed":
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Selesai</Badge>;
    case "failed":
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Gagal</Badge>;
    default:
      return <Badge>Tidak Diketahui</Badge>;
  }
};

const formatDate = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Baru saja";
  if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam lalu`;
  
  return date.toLocaleDateString('id-ID');
};

const PrintJobsList = () => {
  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="text-primary" size={20} />
          Pekerjaan Cetak Aktif
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mockPrintJobs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Tidak ada pekerjaan cetak aktif
          </div>
        ) : (
          <div className="space-y-4">
            {mockPrintJobs.map((job) => (
              <div 
                key={job.id}
                className="print-job-container bg-card border rounded-md p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium truncate max-w-[70%]">{job.name}</div>
                  {getStatusBadge(job.status)}
                </div>
                <div className="text-sm text-muted-foreground mb-3 truncate">
                  {job.fileName} ({job.pages} halaman)
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(job.status)}
                    <span>
                      {job.status === "printing" ? "Sedang mencetak" : 
                       job.status === "pending" ? "Menunggu cetak" :
                       job.status === "completed" ? "Selesai mencetak" :
                       "Gagal mencetak"}
                    </span>
                  </div>
                  <div>
                    {formatDate(job.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrintJobsList;
