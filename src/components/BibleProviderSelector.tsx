import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BibleProviderSelectorProps {
  onChange?: (provider: 'local') => void;
}

export function BibleProviderSelector({ onChange }: BibleProviderSelectorProps) {
  const provider = 'local';

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium">Bible Provider</label>
      <Select value={provider} onValueChange={() => {}}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select provider" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="local">
            Local Bible (Offline)
          </SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Access Bible offline with KJV, ASV, and BBE versions
      </p>
    </div>
  );
}
