
export type PrintJobStatus = 'pending' | 'printing' | 'completed' | 'failed';

export interface PrintJob {
  id: string;
  name: string;
  fileUrl?: string;
  fileName: string;
  createdAt: Date;
  status: PrintJobStatus;
  pages: number;
  copies: number;
  color: boolean;
  doubleSided: boolean;
}

export interface PrintSettings {
  defaultPrinter: string;
  defaultColor: boolean;
  defaultDoubleSided: boolean;
  defaultCopies: number;
}
