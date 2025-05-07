
import { toast } from "sonner";
import { 
  fetchPassageFromApi, 
  getBooksForVersion, 
  getChaptersForBook,
  DEFAULT_BIBLE_VERSION,
  getBibleVersions
} from "./apiBibleService";

// Types for Bible API
export type BibleVerse = {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
};

export type BibleChapter = {
  book_id: string;
  book_name: string;
  chapter: number;
  verses: BibleVerse[];
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

// This function parses Bible references like "Genesis 1", "John 3:16", or "Romans 8:28-39"
export const parseReference = (reference: string): { 
  book: string; 
  chapter: number; 
  verseStart?: number; 
  verseEnd?: number 
} => {
  // Extract book name (everything before the first number)
  const bookMatch = reference.match(/^(\d?\s?[A-Za-z]+)/);
  const book = bookMatch ? bookMatch[0].trim() : "";
  
  // Extract chapter and verse references
  const numberMatch = reference.match(/(\d+)(?::(\d+))?(?:-(\d+))?/);
  
  if (!numberMatch) {
    return { book, chapter: 1 };
  }
  
  const chapter = parseInt(numberMatch[1], 10);
  const verseStart = numberMatch[2] ? parseInt(numberMatch[2], 10) : undefined;
  const verseEnd = numberMatch[3] ? parseInt(numberMatch[3], 10) : undefined;
  
  return { book, chapter, verseStart, verseEnd };
};

// Fetch Bible passage using API.Bible
export const fetchBiblePassage = async (
  reference: string, 
  versionId: string = DEFAULT_BIBLE_VERSION
): Promise<BiblePassageResponse> => {
  try {
    return await fetchPassageFromApi(reference, versionId);
  } catch (error: any) {
    console.error("Error fetching Bible passage:", error);
    toast.error("Failed to load Bible passage", {
      description: error.message || "Please try again later"
    });
    return {
      passage: [],
      reference: "",
      error: error.message
    };
  }
};

// Get available books from API.Bible
export const getAvailableBooks = async (versionId: string = DEFAULT_BIBLE_VERSION): Promise<string[]> => {
  return await getBooksForVersion(versionId);
};

// Get available chapters for a book from API.Bible
export const getAvailableChapters = async (
  book: string,
  versionId: string = DEFAULT_BIBLE_VERSION
): Promise<number[]> => {
  return await getChaptersForBook(book, versionId);
};

// Get available Bible versions
export const getAvailableVersions = async (): Promise<BibleVersion[]> => {
  return await getBibleVersions();
};
