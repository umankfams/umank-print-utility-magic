
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface CloudDriveSelectorProps {
  onFileSelect: (url: string, fileName: string) => void;
}

type CloudProvider = "onedrive" | "googledrive" | "dropbox" | "box";

const CloudDriveSelector = ({ onFileSelect }: CloudDriveSelectorProps) => {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [fileName, setFileName] = useState("");

  const cloudProviders = [
    {
      id: "onedrive" as CloudProvider,
      name: "OneDrive",
      icon: "🗄️",
      urlPattern: /onedrive\.live\.com|1drv\.ms/,
      instructions: "Share your file from OneDrive and paste the link here"
    },
    {
      id: "googledrive" as CloudProvider,
      name: "Google Drive",
      icon: "📁",
      urlPattern: /drive\.google\.com/,
      instructions: "Share your file from Google Drive and paste the link here"
    },
    {
      id: "dropbox" as CloudProvider,
      name: "Dropbox",
      icon: "📦",
      urlPattern: /dropbox\.com/,
      instructions: "Share your file from Dropbox and paste the link here"
    },
    {
      id: "box" as CloudProvider,
      name: "Box",
      icon: "📋",
      urlPattern: /box\.com/,
      instructions: "Share your file from Box and paste the link here"
    }
  ];

  const handleProviderSelect = (provider: CloudProvider) => {
    setSelectedProvider(provider);
    setShareUrl("");
    setFileName("");
  };

  const convertToDirectUrl = (url: string, provider: CloudProvider): string => {
    switch (provider) {
      case "googledrive":
        // Convert Google Drive share URL to direct download URL
        const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
        if (driveMatch) {
          return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
        }
        break;
      case "onedrive":
        // Convert OneDrive share URL to direct download URL
        if (url.includes("onedrive.live.com") || url.includes("1drv.ms")) {
          return url.replace("view.aspx", "download.aspx");
        }
        break;
      case "dropbox":
        // Convert Dropbox share URL to direct download URL
        return url.replace("dropbox.com", "dl.dropboxusercontent.com").replace("?dl=0", "");
      case "box":
        // Box URLs typically work as-is for direct access
        return url;
    }
    return url;
  };

  const handleConnect = () => {
    if (!selectedProvider || !shareUrl || !fileName) {
      toast({
        title: "Error",
        description: "Please select a provider, enter a valid URL and file name",
        variant: "destructive",
      });
      return;
    }

    const provider = cloudProviders.find(p => p.id === selectedProvider);
    if (provider && !provider.urlPattern.test(shareUrl)) {
      toast({
        title: "Error",
        description: `Please enter a valid ${provider.name} URL`,
        variant: "destructive",
      });
      return;
    }

    const directUrl = convertToDirectUrl(shareUrl, selectedProvider);
    onFileSelect(directUrl, fileName);
    
    toast({
      title: "Success",
      description: `Connected to ${provider?.name} file successfully!`,
    });

    // Reset form
    setSelectedProvider(null);
    setShareUrl("");
    setFileName("");
  };

  return (
    <div className="space-y-4">
      <Label>Select Cloud Provider</Label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {cloudProviders.map((provider) => (
          <Card 
            key={provider.id}
            className={`cursor-pointer transition-colors hover:bg-accent ${
              selectedProvider === provider.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleProviderSelect(provider.id)}
          >
            <CardContent className="p-3 text-center">
              <div className="text-2xl mb-1">{provider.icon}</div>
              <div className="text-xs font-medium">{provider.name}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedProvider && (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
          <div className="text-sm text-muted-foreground">
            {cloudProviders.find(p => p.id === selectedProvider)?.instructions}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shareUrl">Share URL</Label>
            <Input
              id="shareUrl"
              value={shareUrl}
              onChange={(e) => setShareUrl(e.target.value)}
              placeholder={`Paste your ${cloudProviders.find(p => p.id === selectedProvider)?.name} share URL here`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileName">File Name</Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter the file name (e.g., document.pdf)"
            />
          </div>

          <Button onClick={handleConnect} className="w-full">
            Connect File
          </Button>
        </div>
      )}
    </div>
  );
};

export default CloudDriveSelector;
