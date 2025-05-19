// src/components/BibleProviderSelector.tsx

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getBibleApiProvider, setBibleApiProvider, getProviderDisplayName } from "@/services/bibleService";
import { BibleApiProvider } from '../types';

interface BibleProviderSelectorProps {
  onChange?: (provider: BibleApiProvider) => void;
}

export function BibleProviderSelector({ onChange }: BibleProviderSelectorProps) {
  const [provider, setProvider] = React.useState<BibleApiProvider>(getBibleApiProvider());

  const handleProviderChange = (value: string) => {
    const newProvider = value as BibleApiProvider;
    setProvider(newProvider);
    setBibleApiProvider(newProvider);
    if (onChange) {
      onChange(newProvider);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium">Bible Provider</label>
      <Select value={provider} onValueChange={handleProviderChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select provider" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="local">
            {getProviderDisplayName("local")} (Offline)
          </SelectItem>
          <SelectItem value="api.bible">
            {getProviderDisplayName("api.bible")}
          </SelectItem>
          <SelectItem value="bible-api.com">
            {getProviderDisplayName("bible-api.com")}
          </SelectItem>
          <SelectItem value="youversion">
            {getProviderDisplayName("youversion")}
          </SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {provider === "local" 
          ? "Access Bible offline with KJV, ASV, and BBE versions" 
          : provider === "youversion" 
            ? "May have CORS issues in some browsers" 
            : provider === "bible-api.com" 
              ? "Simple and reliable alternative" 
              : "Primary Bible API"}
      </p>
    </div>
  );
}
