
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Printer, Upload, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PrintJob, PrintJobStatus } from "@/types";

const PrintJobForm = () => {
  const { toast } = useToast();
  const [jobName, setJobName] = useState("");
  const [copies, setCopies] = useState(1);
  const [color, setColor] = useState(false);
  const [doubleSided, setDoubleSided] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
    }
  };
  
  const resetForm = () => {
    setJobName("");
    setCopies(1);
    setColor(false);
    setDoubleSided(true);
    setFile(null);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to print",
        variant: "destructive",
      });
      return;
    }
    
    const newJob: Partial<PrintJob> = {
      name: jobName || file.name,
      fileName: file.name,
      createdAt: new Date(),
      status: 'pending' as PrintJobStatus,
      pages: Math.floor(Math.random() * 10) + 1, // Mock page count
      copies: copies,
      color: color,
      doubleSided: doubleSided,
    };
    
    toast({
      title: "Success",
      description: "Print job created successfully!",
    });
    
    console.log("Created print job:", newJob);
    resetForm();
  };
  
  return (
    <Card className="w-full mt-6 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="text-primary" size={20} />
          New Print Job
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobName">Job Name (Optional)</Label>
            <Input 
              id="jobName" 
              value={jobName} 
              onChange={(e) => setJobName(e.target.value)}
              placeholder="Enter job name or use filename" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">File to Print</Label>
            {!file ? (
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => document.getElementById("file")?.click()}>
                <Upload className="mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Click to select a file or drag and drop here
                </p>
                <Input 
                  id="file" 
                  type="file" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <span className="truncate max-w-[200px]">{file.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setFile(null)}
                >
                  <X size={16} />
                </Button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="copies">Copies</Label>
              <Input 
                id="copies" 
                type="number" 
                min={1} 
                max={100} 
                value={copies} 
                onChange={(e) => setCopies(parseInt(e.target.value) || 1)} 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="color">Color</Label>
                <Switch 
                  id="color" 
                  checked={color} 
                  onCheckedChange={setColor} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="doubleSided">Double-sided</Label>
                <Switch 
                  id="doubleSided" 
                  checked={doubleSided} 
                  onCheckedChange={setDoubleSided} 
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={resetForm}>Cancel</Button>
        <Button onClick={handleSubmit}>Print Document</Button>
      </CardFooter>
    </Card>
  );
};

export default PrintJobForm;
