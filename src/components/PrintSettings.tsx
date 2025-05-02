
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Settings, Save, Printer, RefreshCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PrintSettings as PrintSettingsType } from "@/types";

const defaultSettings: PrintSettingsType = {
  defaultPrinter: "Office Printer (HP LaserJet Pro)",
  defaultColor: false,
  defaultDoubleSided: true,
  defaultCopies: 1
};

const PrintSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrintSettingsType>(defaultSettings);
  const [isTestingPrinter, setIsTestingPrinter] = useState(false);
  
  const handleSaveSettings = () => {
    // In a real app, we would save to localStorage or a backend
    console.log("Saving settings:", settings);
    
    toast({
      title: "Settings saved",
      description: "Your print settings have been updated successfully."
    });
  };
  
  const handleTestPrinter = () => {
    setIsTestingPrinter(true);
    
    // Simulate printer test
    setTimeout(() => {
      setIsTestingPrinter(false);
      
      toast({
        title: "Printer test complete",
        description: `Successfully connected to ${settings.defaultPrinter}.`
      });
    }, 2000);
  };
  
  return (
    <Card className="w-full mt-6 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="text-primary" size={20} />
          Print Settings
        </CardTitle>
        <CardDescription>
          Configure your default printing preferences
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="defaultPrinter">Default Printer</Label>
          <Select
            value={settings.defaultPrinter}
            onValueChange={(value) => setSettings({...settings, defaultPrinter: value})}
          >
            <SelectTrigger id="defaultPrinter">
              <SelectValue placeholder="Select a printer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Office Printer (HP LaserJet Pro)">Office Printer (HP LaserJet Pro)</SelectItem>
              <SelectItem value="Reception Printer (Epson WorkForce)">Reception Printer (Epson WorkForce)</SelectItem>
              <SelectItem value="Executive Printer (Canon imagePRESS)">Executive Printer (Canon imagePRESS)</SelectItem>
              <SelectItem value="Home Printer (Brother MFC)">Home Printer (Brother MFC)</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center justify-end mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestPrinter}
              disabled={isTestingPrinter}
              className="text-xs"
            >
              {isTestingPrinter ? (
                <>
                  <RefreshCcw className="mr-2 h-3 w-3 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Printer className="mr-2 h-3 w-3" />
                  Test Connection
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-md font-medium">Default Print Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="defaultColor">Color Printing</Label>
                <Switch 
                  id="defaultColor" 
                  checked={settings.defaultColor} 
                  onCheckedChange={(checked) => setSettings({...settings, defaultColor: checked})} 
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enable to use color by default for all print jobs
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="defaultDoubleSided">Double-sided</Label>
                <Switch 
                  id="defaultDoubleSided" 
                  checked={settings.defaultDoubleSided} 
                  onCheckedChange={(checked) => setSettings({...settings, defaultDoubleSided: checked})} 
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enable to use double-sided printing by default
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="defaultCopies">Default Number of Copies</Label>
            <Input
              id="defaultCopies"
              type="number"
              min={1}
              max={100}
              value={settings.defaultCopies}
              onChange={(e) => setSettings({...settings, defaultCopies: parseInt(e.target.value) || 1})}
              className="w-24"
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button onClick={handleSaveSettings} className="flex items-center gap-1">
          <Save size={16} />
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PrintSettings;
