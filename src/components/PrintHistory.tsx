
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, FileText } from "lucide-react";
import { PrintJob, PrintJobStatus } from "@/types";

const mockHistoryJobs: PrintJob[] = [
  {
    id: "5",
    name: "Annual Report 2023",
    fileName: "Annual_Report_2023.pdf",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    status: "completed",
    pages: 45,
    copies: 2,
    color: true,
    doubleSided: true,
  },
  {
    id: "6",
    name: "Employee Handbook",
    fileName: "Employee_Handbook_2024.pdf",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    status: "completed",
    pages: 28,
    copies: 10,
    color: true,
    doubleSided: true,
  },
  {
    id: "7",
    name: "Weekly Schedule",
    fileName: "Schedule_Week_18.docx",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
    status: "completed",
    pages: 2,
    copies: 15,
    color: false,
    doubleSided: true,
  },
  {
    id: "8",
    name: "Contract Draft",
    fileName: "Contract_Draft_v2.pdf",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30), // 30 hours ago
    status: "failed",
    pages: 12,
    copies: 1,
    color: false,
    doubleSided: true,
  },
  {
    id: "9",
    name: "Marketing Flyer",
    fileName: "Summer_Sale_Flyer.pdf",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 48 hours ago
    status: "completed",
    pages: 1,
    copies: 100,
    color: true,
    doubleSided: false,
  },
  {
    id: "10",
    name: "Monthly Invoice",
    fileName: "Invoice_April_2024.pdf",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 72 hours ago
    status: "completed",
    pages: 3,
    copies: 1,
    color: false,
    doubleSided: true,
  },
];

const getStatusBadge = (status: PrintJobStatus) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
    case "printing":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Printing</Badge>;
    case "completed":
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
    case "failed":
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const PrintHistory = () => {
  return (
    <Card className="w-full mt-6 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="text-primary" size={20} />
          Print History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Pages</TableHead>
              <TableHead>Copies</TableHead>
              <TableHead>Settings</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockHistoryJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <div className="flex items-start gap-2">
                    <FileText size={16} className="text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">{job.name}</div>
                      <div className="text-xs text-muted-foreground">{job.fileName}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatDate(job.createdAt)}</TableCell>
                <TableCell>{job.pages}</TableCell>
                <TableCell>{job.copies}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Badge variant="outline" className="text-xs">
                      {job.color ? "Color" : "B&W"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {job.doubleSided ? "Double-sided" : "Single-sided"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PrintHistory;
