import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BiblePassageVerse } from '@/services/types';
import { cn } from '@/lib/utils';

type PassageDisplayProps = {
  verses: BiblePassageVerse[];
  isImmersiveMode?: boolean;
  isDarkTheme?: boolean;
};

export function PassageDisplay({ 
  verses, 
  isImmersiveMode = false,
  isDarkTheme = false 
}: PassageDisplayProps) {
  return (
    <ScrollArea className="flex-1 px-4">
      <div className={cn(
        "space-y-4 pb-8",
        isImmersiveMode && "max-w-2xl mx-auto",
        isDarkTheme ? "text-gray-200" : "text-gray-700"
      )}>
        {verses.map((verse) => (
          <p key={verse.id} className="leading-relaxed">
            <sup className="mr-1 text-xs text-gray-500">
              {verse.verse}
            </sup>
            {verse.text}
          </p>
        ))}
      </div>
    </ScrollArea>
  );
}
