import { getPassage } from './localBibleService';
import { availableVersions } from './bibleDataLoader';
import { BibleVerse, BiblePassageResponse, BibleVersion } from './types';

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

export const getAvailableBooks = async (version: string = 'kjv'): Promise<string[]> => {
  try {
    const data = await import(`../../bible_data/${version}.json`);
    return Object.keys(data.books);
  } catch (error) {
    console.error('Error loading Bible books:', error);
    return [];
  }
};

export const getAvailableChapters = async (
  bookName: string,
  version: string = 'kjv'
): Promise<number[]> => {
  try {
    const data = await import(`../../bible_data/${version}.json`);
    const book = data.books[bookName];
    if (!book) {
      throw new Error(`Book ${bookName} not found`);
    }
    const chapters = Object.keys(book).map(ch => parseInt(ch, 10));
    return chapters.sort((a, b) => a - b);
  } catch (error) {
    console.error('Error loading chapters:', error);
    return [];
  }
};