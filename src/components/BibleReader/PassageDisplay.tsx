import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import type { BibleData } from "@/services/types";
import { VerseAnnotations } from "./VerseAnnotations";
import { CrossReferences } from "./CrossReferences";
import { VerseComparison } from "./VerseComparison";
import { useVerseAnnotations } from "@/hooks/useVerseAnnotations";

interface PassageDisplayProps {
  bibleData: BibleData;
  reference: string;
  isDarkTheme?: boolean;
  isImmersiveMode?: boolean;
}

export function PassageDisplay({
  bibleData,
  reference,
  isDarkTheme = false,
  isImmersiveMode = false
}: PassageDisplayProps) {
  // Parse reference
  const [book, chapterVerse] = reference.split(" ");
  const [chapter, verse] = (chapterVerse || "").split(":");
  
  // Find the book and chapter in the Bible data
  const bookData = bibleData.books.find(b => 
    b.name.toLowerCase() === book.toLowerCase()
  );
  
  const chapterData = bookData?.chapters?.find(c => 
    c.chapter === parseInt(chapter || "1", 10)
  );
  
  if (!bookData || !chapterData) {
    return (
      <div className={`text-center p-4 ${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>
        Passage not found
      </div>
    );
  }

  return (
    <ScrollArea className={`h-[500px] ${isImmersiveMode ? "px-8" : "px-4"}`}>
      <div className={`space-y-4 ${isDarkTheme ? "text-gray-100" : "text-gray-900"}`}>
        <h2 className="text-2xl font-semibold">
          {bookData.name} {chapterData.chapter}
        </h2>
        
        <div className="space-y-2">
          {chapterData.verses.map((v) => {
            const verseReference = `${bookData.name} ${chapterData.chapter}:${v.verse}`;
            const { annotations } = useVerseAnnotations(verseReference);
            const highlight = annotations.find(a => a.type === 'highlight');
            
            return (
              <div key={v.verse} className="group flex items-start gap-2">
                <p 
                  className={`flex-1 leading-relaxed ${isImmersiveMode ? "text-lg" : "text-base"}`}
                  style={highlight ? { backgroundColor: highlight.color } : undefined}
                >
                  <span className="text-sm font-medium text-gray-500 mr-2">
                    {v.verse}
                  </span>
                  {v.text}
                </p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                    <VerseAnnotations 
                      reference={verseReference}
                      isDarkTheme={isDarkTheme} 
                    />
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Cross References
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <CrossReferences
                          reference={verseReference}
                          onSelectReference={(ref) => onSelectReference(ref)}
                          isDarkTheme={isDarkTheme}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Compare Versions
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <VerseComparison
                          reference={verseReference}
                          isDarkTheme={isDarkTheme}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
