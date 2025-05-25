import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { BibleSearchResult } from "@/services/types";

interface SearchResultsProps {
  results: BibleSearchResult[];
  onSelectReference: (reference: string) => void;
  isDarkTheme?: boolean;
}

export function SearchResults({ 
  results, 
  onSelectReference, 
  isDarkTheme = false 
}: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className={`text-center p-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
        No results found
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 p-4">
        {results.map((result) => (
          <Card 
            key={result.reference}
            className={`p-4 ${isDarkTheme ? 'bg-gray-800 hover:bg-gray-700' : 'hover:bg-gray-50'}`}
          >
            <Button
              variant="link"
              className={`p-0 h-auto font-semibold ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`}
              onClick={() => onSelectReference(result.reference)}
            >
              {result.reference}
            </Button>
            <p className={`mt-2 text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
              {result.text}
            </p>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
