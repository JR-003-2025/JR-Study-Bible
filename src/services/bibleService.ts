import { getPassage, availableVersions } from './localBibleService';

// Types for Bible API
export type BibleVerse = {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
};

export type BiblePassageResponse = {
  passage: BibleVerse[];
  reference: string;
  error?: string;
};

export type BibleVersion = {
  id: string;
  name: string;
  abbreviation: string;
};

export const getDefaultVersionId = () => 'kjv';

export const getAvailableVersions = (): BibleVersion[] => {
  return availableVersions;
};

export const fetchBiblePassage = async (
  reference: string,
  version: string = 'kjv'
): Promise<BiblePassageResponse> => {
  try {
    return await getPassage(reference, version);
  } catch (error) {
    console.error('Error fetching Bible passage:', error);
    return {
      passage: [],
      reference,
      error: 'Failed to fetch Bible passage'
    };
  }
};