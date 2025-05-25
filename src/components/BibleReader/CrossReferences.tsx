import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ArrowUpRightFromSquare, BookOpen } from 'lucide-react';
import { useCrossReferences } from '@/hooks/useCrossReferences';
import type { CrossReference } from '@/services/crossReferenceService';

interface CrossReferencesProps {
  reference: string;
  onSelectReference: (reference: string) => void;
  isDarkTheme?: boolean;
}

export function CrossReferences({
  reference,
  onSelectReference,
  isDarkTheme = false
}: CrossReferencesProps) {
  const { crossRefs, isLoading } = useCrossReferences(reference);
  const [selectedType, setSelectedType] = useState<CrossReference['type'] | 'all'>('all');

  const filteredRefs = crossRefs.filter(ref => 
    selectedType === 'all' || ref.type === selectedType
  );

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['all', 'direct', 'parallel', 'topical'] as const).map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(type)}
            className={isDarkTheme ? 'hover:bg-gray-800' : ''}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {filteredRefs.length === 0 ? (
            <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
              No cross-references found.
            </p>
          ) : (
            filteredRefs.map((ref, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card 
                      className={`p-2 flex items-center justify-between cursor-pointer
                        ${isDarkTheme ? 'bg-gray-800 hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                      onClick={() => onSelectReference(ref.targetRef)}
                    >
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4" />
                        <span className="text-sm">{ref.targetRef}</span>
                      </div>
                      <ArrowUpRightFromSquare className="h-4 w-4" />
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{ref.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
