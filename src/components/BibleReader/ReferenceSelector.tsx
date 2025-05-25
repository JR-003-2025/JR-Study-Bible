import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { availableVersions } from "@/services/bibleDataLoader";

interface ReferenceSelectorProps {
  version: string;
  onVersionChange: (version: string) => void;
  initialReference: string;
  isDarkTheme?: boolean;
  showSettings?: boolean;
}

export function ReferenceSelector({
  version,
  onVersionChange,
  initialReference,
  isDarkTheme = false,
  showSettings = true
}: ReferenceSelectorProps) {
  const [reference, setReference] = useState(initialReference);
  
  return (
    <div className="flex flex-col space-y-4">
      {showSettings && (
        <div className="flex items-center space-x-4">
          <Select value={version} onValueChange={onVersionChange}>
            <SelectTrigger className={`w-[200px] ${isDarkTheme ? "bg-gray-800 text-white" : ""}`}>
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              {availableVersions.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Enter reference (e.g. John 3:16)"
            className={`flex-1 ${isDarkTheme ? "bg-gray-800 text-white" : ""}`}
          />
          
          <Button
            onClick={() => {/* TODO: Handle reference lookup */}}
            variant={isDarkTheme ? "secondary" : "default"}
          >
            Go
          </Button>
        </div>
      )}
    </div>
  );
}
