// src/components/BibleVersionSelector.tsx

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllBibleVersions } from "@/services/bibleService";

interface BibleVersionSelectorProps {
  value: string;
  onChange: (version: string) => void;
}

export function BibleVersionSelector({ value, onChange }: BibleVersionSelectorProps) {
  const versions = getAllBibleVersions();
  
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium">Bible Version</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select version" />
        </SelectTrigger>
        <SelectContent>
          {versions.map((version) => (
            <SelectItem key={version.id} value={version.id}>
              {version.name}
              {version.source === 'local' && ' (Offline)'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
