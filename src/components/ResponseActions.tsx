
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Share, Download, Save } from "lucide-react";
import { toast } from "sonner";

type ResponseActionsProps = {
  content: string;
  type: "exegesis" | "qa" | "sermon" | "search";
  passage?: string;
};

export function ResponseActions({ content, type, passage }: ResponseActionsProps) {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [title, setTitle] = useState(() => {
    switch (type) {
      case "exegesis": return `Exegesis of ${passage || "passage"}`;
      case "qa": return "Bible Question";
      case "sermon": return "Sermon Outline";
      case "search": return "Bible Search Results";
    }
  });

  const handleShare = () => {
    navigator.clipboard.writeText(content);
    toast.success("Content copied to clipboard", {
      description: "You can now share this with others"
    });
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Downloaded successfully");
  };

  const handleSave = () => {
    // In a real app, this would save to Supabase
    toast.success("Response saved successfully", {
      description: "You can access it in your dashboard"
    });
    setIsSaveDialogOpen(false);
  };

  return (
    <div className="flex gap-2 mt-4">
      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share className="h-4 w-4 mr-2" />
        Share
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownload}>
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>
      <Button variant="outline" size="sm" onClick={() => setIsSaveDialogOpen(true)}>
        <Save className="h-4 w-4 mr-2" />
        Save
      </Button>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Response</DialogTitle>
          </DialogHeader>
          <div className="my-4">
            <label htmlFor="response-title" className="text-sm font-medium block mb-2">
              Title
            </label>
            <Input
              id="response-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Response</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
