import { toast } from "sonner";

// Import local Bible data
import kjvData from '../../bible_data/kjv.json';
import asvData from '../../bible_data/asv.json';
import bbeData from '../../bible_data/bbe.json';

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

// Add these types for backward compatibility
export type BibleApiProvider = 'local';
export const getBibleApiProvider = (): BibleApiProvider => 'local';
export const setBibleApiProvider = (_provider: BibleApiProvider) => {};
export const getDefaultVersionId = () => DEFAULT_VERSION;
export const isYouVersionId = (_versionId: string) => false;
export const detectYouVersionCorsIssue = async () => true;

// Local Bible data configuration
const bibleData = {
  kjv: kjvData,
  asv: asvData,
  bbe: bbeData
};

export const DEFAULT_VERSION = "kjv";

export const availableVersions: BibleVersion[] = [
  { id: 'kjv', name: 'King James Version', abbreviation: 'KJV' },
  { id: 'asv', name: 'American Standard Version', abbreviation: 'ASV' },
  { id: 'bbe', name: 'Bible in Basic English', abbreviation: 'BBE' }
];

// Parse a Bible reference
export const parseReference = (reference: string): { 
  bookName: string; 
  chapter: number; 
  verseStart?: number; 
  verseEnd?: number 
} => {
  if (!reference || typeof reference !== 'string') {
    throw new Error("Invalid reference: must be a non-empty string");
  }

  const parts = reference.trim().split(" ");
  if (parts.length < 2) {
    throw new Error("Invalid reference format. Expected 'Book Chapter:Verse'");
  }
  
  const chapterVersePart = parts[parts.length - 1];
  const bookName = parts.slice(0, parts.length - 1).join(" ");
  
  if (!bookName) {
    throw new Error("Invalid reference: book name is required");
  }
  
  let chapter: number;
  let verseStart: number | undefined;
  let verseEnd: number | undefined;
  
  if (chapterVersePart.includes(":")) {
    const [chapterStr, verseRange] = chapterVersePart.split(":");
    chapter = parseInt(chapterStr, 10);
    
    if (verseRange.includes("-")) {
      const [start, end] = verseRange.split("-");
      verseStart = parseInt(start, 10);
      verseEnd = parseInt(end, 10);
      
      if (isNaN(verseStart) || isNaN(verseEnd)) {
        throw new Error("Invalid verse range: both start and end must be numbers");
      }
      if (verseStart > verseEnd) {
        throw new Error("Invalid verse range: start verse must be less than or equal to end verse");
      }
    } else {
      verseStart = parseInt(verseRange, 10);
      if (isNaN(verseStart)) {
        throw new Error("Invalid verse number");
      }
    }
  } else {
    chapter = parseInt(chapterVersePart, 10);
  }
  
  if (isNaN(chapter) || chapter < 1) {
    throw new Error("Invalid chapter number: must be a positive number");
  }
  
  return { bookName, chapter, verseStart, verseEnd };
};

// Get available Bible versions
export const getAvailableVersions = async (): Promise<BibleVersion[]> => {
  return availableVersions;
};

// Get available books
export const getAvailableBooks = async (versionId: string = DEFAULT_VERSION): Promise<string[]> => {
  const version = versionId.toLowerCase();
  const data = bibleData[version as keyof typeof bibleData];
  if (!data) {
    console.error(`Version ${versionId} not found`);
    return [];
  }
  return Object.keys(data);
};

// Get available chapters for a book
export const getAvailableChapters = async (
  book: string,
  versionId: string = DEFAULT_VERSION
): Promise<number[]> => {
  const version = versionId.toLowerCase();
  const data = bibleData[version as keyof typeof bibleData];
  if (!data) {
    console.error(`Version ${versionId} not found`);
    return [];
  }

  const bookData = data[book];
  if (!bookData) {
    console.error(`Book ${book} not found`);
    return [];
  }

  return Object.keys(bookData).map(chapter => parseInt(chapter, 10)).sort((a, b) => a - b);
};

// Get Bible passage
export const fetchBiblePassage = async (
  reference: string,
  versionId: string = DEFAULT_VERSION
): Promise<BiblePassageResponse> => {
  try {
    const { bookName, chapter, verseStart, verseEnd } = parseReference(reference);
    const version = versionId.toLowerCase();
    const data = bibleData[version as keyof typeof bibleData];

    if (!data) {
      throw new Error(`Version ${versionId} not found`);
    }

    const bookData = data[bookName];
    if (!bookData) {
      throw new Error(`Book ${bookName} not found`);
    }

    const chapterData = bookData[chapter];
    if (!chapterData) {
      throw new Error(`Chapter ${chapter} not found in ${bookName}`);
    }

    let verses: BibleVerse[] = [];
    
    if (verseStart && verseEnd) {
      // Verse range
      for (let v = verseStart; v <= verseEnd; v++) {
        if (chapterData[v]) {
          verses.push({
            book_id: bookName.substring(0, 3).toUpperCase(),
            book_name: bookName,
            chapter,
            verse: v,
            text: chapterData[v]
          });
        }
      }
    } else if (verseStart) {
      // Single verse
      if (chapterData[verseStart]) {
        verses.push({
          book_id: bookName.substring(0, 3).toUpperCase(),
          book_name: bookName,
          chapter,
          verse: verseStart,
          text: chapterData[verseStart]
        });
      }
    } else {
      // Whole chapter
      verses = Object.entries(chapterData).map(([verse, text]) => ({
        book_id: bookName.substring(0, 3).toUpperCase(),
        book_name: bookName,
        chapter,
        verse: parseInt(verse, 10),
        text: text as string
      }));
    }

    if (verses.length === 0) {
      throw new Error(`No verses found for reference "${reference}"`);
    }

    return {
      passage: verses,
      reference
    };

  } catch (error: any) {
    console.error("Error fetching Bible passage:", error);
    const errorMessage = error.message || "Please try again later";
    toast.error("Failed to load Bible passage", {
      description: errorMessage
    });
    return {
      passage: [],
      reference,
      error: errorMessage
    };
  }
};