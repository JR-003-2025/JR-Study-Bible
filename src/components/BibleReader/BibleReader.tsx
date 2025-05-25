import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useBibleData } from "@/hooks/useBibleData";
import { getDefaultVersionId } from "@/services/bibleService";
import { ReferenceSelector } from "./ReferenceSelector";
import { PassageDisplay } from "./PassageDisplay";
import { SearchDialog } from "./SearchDialog";

interface BibleReaderProps {
  initialReference?: string;
  isDarkTheme?: boolean;
  isImmersiveMode?: boolean;
  showSettings?: boolean;
}

export function BibleReader({
  initialReference = "Genesis 1:1",
  isDarkTheme = false,
  isImmersiveMode = false,
  showSettings = true
}: BibleReaderProps) {
  const [version, setVersion] = useState(getDefaultVersionId());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: bibleData, isLoading, error } = useBibleData(version);
  
  const handleVersionChange = (newVersion: string) => {
    setVersion(newVersion);
  };

  const handleReferenceSelect = (reference: string) => {
    // TODO: Update the current reference
  };

  if (isLoading) {
    return (
      <Card className="p-4 space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </Card>
    );
  }

  if (error || !bibleData) {
    toast.error("Failed to load Bible data. Please try again later.");
    return null;
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${isDarkTheme ? "bg-gray-900 text-white" : ""}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <ReferenceSelector 
            version={version}
            onVersionChange={handleVersionChange}
            initialReference={initialReference}
            isDarkTheme={isDarkTheme}
            showSettings={showSettings}
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSearchOpen(true)}
            className={isDarkTheme ? "hover:bg-gray-800" : "hover:bg-gray-100"}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-4">
          <PassageDisplay 
            bibleData={bibleData}
            reference={initialReference}
            isDarkTheme={isDarkTheme}
            isImmersiveMode={isImmersiveMode}
          />
        </div>
      </div>

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectReference={handleReferenceSelect}
        version={version}
        isDarkTheme={isDarkTheme}
      />
    </Card>
  );
}
