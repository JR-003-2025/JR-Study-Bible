// Common types used across components
export interface BibleReaderProps {
  initialReference?: string;
  isDarkTheme?: boolean;
  isImmersiveMode?: boolean;
  showSettings?: boolean;
  onReferenceChange?: (reference: string) => void;
}

export interface PassageDisplayProps extends Pick<BibleReaderProps, 'isDarkTheme' | 'isImmersiveMode'> {
  reference: string;
  onReferenceChange: (reference: string) => void;
  bibleData?: BibleData;
  isLoading?: boolean;
}

export interface ReferenceSelectorProps extends Pick<BibleReaderProps, 'isDarkTheme'> {
  reference: string;
  onReferenceChange: (reference: string) => void;
  version: string;
  onVersionChange: (version: string) => void;
}

// Import and re-export types from services for convenience
export type { 
  BibleData,
  BibleBook,
  BibleChapter,
  BibleVerse,
  BibleVersion,
  BibleSearchResult,
  CrossReference,
  VerseAnnotation,
  ReadingPlan,
  ReadingEntry
} from '@/services/types';
