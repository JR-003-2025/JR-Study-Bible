import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsItem, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useVerseComparison, usePassageComparison } from "@/hooks/useVerseComparison";
import { availableVersions } from "@/services/bibleDataLoader";
import { ArrowUpRightFromSquare, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface VerseComparisonProps {
  reference: string;
  onSelectReference?: (reference: string) => void;
  isDarkTheme?: boolean;
  versions?: string[];
}

export function VerseComparison({
  reference,
  onSelectReference,
  isDarkTheme = false,
  versions = ['kjv', 'asv', 'bbe'],
}: VerseComparisonProps) {
  const { data: comparison, isLoading } = useVerseComparison(reference, versions);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
    );
  }

  if (!comparison) return null;

  return (
    <Card className={`p-4 ${isDarkTheme ? 'bg-gray-800' : ''}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkTheme ? 'text-white' : ''}`}>
        {comparison.reference}
      </h3>

      <div className="space-y-4">
        {Object.entries(comparison.versions).map(([version, data]) => (
          <div key={version} className="space-y-1">
            <div className={`text-sm font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
              {availableVersions.find(v => v.id === version)?.name || version.toUpperCase()}
            </div>
            <p className={isDarkTheme ? 'text-white' : 'text-gray-900'}>
              {data.text}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

interface PassageComparisonProps {
  startRef: string;
  endRef: string;
  onSelectReference?: (reference: string) => void;
  isDarkTheme?: boolean;
  versions?: string[];
}

export function PassageComparison({
  startRef,
  endRef,
  onSelectReference,
  isDarkTheme = false,
  versions = ['kjv', 'asv', 'bbe'],
}: PassageComparisonProps) {
  const { data: comparisons, isLoading } = usePassageComparison(startRef, endRef, versions);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!comparisons) return null;

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-6">
        {comparisons.map((comparison, index) => (
          <Card
            key={index}
            className={`p-4 ${isDarkTheme ? 'bg-gray-800' : ''}`}
          >
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full justify-between"
                >
                  <span>{comparison.reference}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="space-y-4">
                  {Object.entries(comparison.versions).map(([version, data]) => (
                    <div key={version} className="space-y-1">
                      <div className={`text-sm font-medium ${
                        isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {availableVersions.find(v => v.id === version)?.name || version.toUpperCase()}
                      </div>
                      <p className={isDarkTheme ? 'text-white' : 'text-gray-900'}>
                        {data.text}
                      </p>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
