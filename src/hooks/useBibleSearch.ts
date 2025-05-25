import { useQuery } from '@tanstack/react-query';
import { bibleSearchService } from '@/services/bibleSearchService';
import type { BibleSearchResult } from '@/services/types';

export function useBibleSearch(query: string, version: string) {
  return useQuery<BibleSearchResult[]>({
    queryKey: ['bibleSearch', version, query],
    queryFn: () => bibleSearchService.search(query, version),
    enabled: query.length >= 3, // Only search when query is at least 3 characters
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
  });
}
