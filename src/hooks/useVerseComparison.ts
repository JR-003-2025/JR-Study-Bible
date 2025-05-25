import { useQuery } from '@tanstack/react-query';
import { verseComparisonService, VerseComparison } from '@/services/verseComparisonService';

export function useVerseComparison(reference: string, versions: string[]) {
  return useQuery<VerseComparison>({
    queryKey: ['verseComparison', reference, versions],
    queryFn: () => verseComparisonService.compareVerses(reference, versions),
    enabled: !!reference && versions.length > 0,
  });
}

export function usePassageComparison(startRef: string, endRef: string, versions: string[]) {
  return useQuery<VerseComparison[]>({
    queryKey: ['passageComparison', startRef, endRef, versions],
    queryFn: () => verseComparisonService.comparePassages(startRef, endRef, versions),
    enabled: !!startRef && !!endRef && versions.length > 0,
  });
}
