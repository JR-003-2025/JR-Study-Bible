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
    // Handle empty or invalid references
    if (!reference?.trim()) {
      return {
        passage: [],
        reference: '',
        error: 'Please enter a Bible reference'
      };
    }

    const response = await getPassage(reference, version);
    
    // Add more detailed error messages
    if (response.error) {
      return {
        passage: [],
        reference,
        error: response.error
      };
    }

    // Validate the response
    if (!response.passage || response.passage.length === 0) {
      return {
        passage: [],
        reference,
        error: 'No verses found for this reference'
      };
    }

    return response;
  } catch (error) {
    console.error('Error fetching Bible passage:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Bible passage';
    return {
      passage: [],
      reference,
      error: errorMessage
    };
  }
};

export const getAvailableBooks = async (version: string = 'kjv'): Promise<string[]> => {
  try {
    const data = await import(`../../bible_data/${version}.json`);
    return data.books.map(book => book.name);
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
    const book = data.books.find(b => b.name === bookName);
    if (!book) {
      throw new Error(`Book ${bookName} not found`);
    }
    const chapters = book.chapters.map(ch => ch.chapter);
    return chapters.sort((a, b) => a - b);
  } catch (error) {
    console.error('Error loading chapters:', error);
    return [];
  }
};