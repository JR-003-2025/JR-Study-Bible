import { useQuery } from '@tanstack/react-query';
import { loadBibleVersion } from '../services/bibleDataLoader';
import { BibleData } from '../services/types';

export function useBibleData(version: string) {
  return useQuery<BibleData>({
    queryKey: ['bibleVersion', version],
    queryFn: () => loadBibleVersion(version),
    staleTime: Infinity, // Bible data doesn't change, so we can cache it indefinitely
    cacheTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  });
}
