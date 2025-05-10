
import { toast } from "sonner";
import { BibleVerse, BiblePassageResponse, BibleVersion } from "./bibleService";

// Base URL for the wldeh Bible API
const API_URL = "https://cdn.jsdelivr.net/gh/wldeh/bible-api";

// Default Bible version to use
export const DEFAULT_BIBLE_VERSION = "en-kjv";

// Cache for API responses
const cache: Record<string, any> = {};

// Helper to make API requests with caching
const fetchFromApi = async (endpoint: string): Promise<any> => {
  const fullUrl = `${API_URL}${endpoint}`;
  
  if (cache[fullUrl]) {
    return cache[fullUrl];
  }

  try {
    console.log(`Fetching from wldeh Bible API: ${fullUrl}`);
    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    cache[fullUrl] = data;
    return data;
  } catch (error: any) {
    console.error("Bible API Error:", error);
    toast.error("Error fetching Bible data", {
      description: error.message || "Please try again later",
    });
    throw error;
  }
};

// Get available Bible versions
export const getBibleVersions = async (): Promise<BibleVersion[]> => {
  try {
    const response = await fetchFromApi("/bibles/bibles.json");
    return response.map((version: any) => ({
      id: version.id,
      name: version.name || version.id,
      abbreviation: version.abbreviation || version.id,
    }));
  } catch (error) {
    console.error("Error fetching Bible versions:", error);
    return [];
  }
};

// Get books for a specific Bible version
export const getBooksForVersion = async (versionId: string = DEFAULT_BIBLE_VERSION): Promise<string[]> => {
  try {
    const response = await fetchFromApi(`/bibles/${versionId}/books/books.json`);
    return response.map((book: any) => book.name);
  } catch (error) {
    console.error("Error fetching Bible books:", error);
    return [];
  }
};

// Get chapters for a specific book and version
export const getChaptersForBook = async (
  book: string,
  versionId: string = DEFAULT_BIBLE_VERSION
): Promise<number[]> => {
  try {
    // First get all books to find the book id/slug
    const booksResponse = await fetchFromApi(`/bibles/${versionId}/books/books.json`);
    const bookData = booksResponse.find(
      (b: any) => b.name.toLowerCase() === book.toLowerCase()
    );

    if (!bookData) {
      throw new Error(`Book "${book}" not found`);
    }

    const bookSlug = bookData.slug || book.toLowerCase();
    
    // Then get chapters for that book
    const chaptersResponse = await fetchFromApi(`/bibles/${versionId}/books/${bookSlug}/chapters.json`);
    
    // Return chapter numbers as integers
    return chaptersResponse.map((chapter: any) => {
      const chapterNum = parseInt(chapter.number, 10);
      return isNaN(chapterNum) ? 0 : chapterNum;
    }).filter((num: number) => num > 0); // Filter out any zeros
  } catch (error) {
    console.error(`Error fetching chapters for ${book}:`, error);
    return [];
  }
};

// Parse verses from chapter JSON
const parseVersesFromChapterJSON = (
  chapterData: any,
  bookName: string,
  chapter: number
): BibleVerse[] => {
  const verses: BibleVerse[] = [];
  
  // Generate a book_id from the book name
  const book_id = bookName.substring(0, 3).toUpperCase();
  
  if (chapterData.verses && Array.isArray(chapterData.verses)) {
    chapterData.verses.forEach((verse: any) => {
      verses.push({
        book_id,
        book_name: bookName,
        chapter,
        verse: parseInt(verse.number, 10),
        text: verse.text,
      });
    });
  }
  
  return verses;
};

// Find the correct book slug for the API
const getBookSlug = async (bookName: string, versionId: string): Promise<string | null> => {
  try {
    const booksResponse = await fetchFromApi(`/bibles/${versionId}/books/books.json`);
    
    // First try exact match on name
    const exactMatch = booksResponse.find((b: any) => 
      b.name.toLowerCase() === bookName.toLowerCase()
    );
    if (exactMatch) return exactMatch.slug || exactMatch.name.toLowerCase();
    
    // Try partial match on name
    const partialMatch = booksResponse.find((b: any) => 
      b.name.toLowerCase().includes(bookName.toLowerCase()) || 
      bookName.toLowerCase().includes(b.name.toLowerCase())
    );
    if (partialMatch) return partialMatch.slug || partialMatch.name.toLowerCase();
    
    return bookName.toLowerCase().replace(/\s+/g, "-");
  } catch (error) {
    console.error("Error finding book slug:", error);
    return bookName.toLowerCase().replace(/\s+/g, "-");
  }
};

// Get a single verse
export const fetchVerse = async (
  bookName: string,
  chapter: number,
  verse: number,
  versionId: string = DEFAULT_BIBLE_VERSION
): Promise<BibleVerse | null> => {
  try {
    const bookSlug = await getBookSlug(bookName, versionId);
    if (!bookSlug) {
      throw new Error(`Book "${bookName}" not found`);
    }
    
    const verseData = await fetchFromApi(`/bibles/${versionId}/books/${bookSlug}/chapters/${chapter}/verses/${verse}.json`);
    
    return {
      book_id: bookName.substring(0, 3).toUpperCase(),
      book_name: bookName,
      chapter,
      verse,
      text: verseData.text,
    };
  } catch (error) {
    console.error(`Error fetching verse ${bookName} ${chapter}:${verse}:`, error);
    return null;
  }
};

// Get a verse range
export const fetchVerseRange = async (
  bookName: string,
  chapter: number,
  startVerse: number,
  endVerse: number,
  versionId: string = DEFAULT_BIBLE_VERSION
): Promise<BibleVerse[]> => {
  try {
    const verses: BibleVerse[] = [];
    for (let v = startVerse; v <= endVerse; v++) {
      const verse = await fetchVerse(bookName, chapter, v, versionId);
      if (verse) verses.push(verse);
    }
    return verses;
  } catch (error) {
    console.error(`Error fetching verse range ${bookName} ${chapter}:${startVerse}-${endVerse}:`, error);
    return [];
  }
};

// Get a Bible passage by reference
export const fetchPassageFromApi = async (
  reference: string,
  versionId: string = DEFAULT_BIBLE_VERSION
): Promise<BiblePassageResponse> => {
  try {
    // Parse the reference parts
    const parts = reference.split(" ");
    if (parts.length < 2) {
      throw new Error("Invalid reference format. Expected 'Book Chapter:Verse'");
    }
    
    // Extract book name and chapter/verse information
    const chapterVersePart = parts[parts.length - 1];
    const bookName = parts.slice(0, parts.length - 1).join(" ");
    
    // Find the book slug
    const bookSlug = await getBookSlug(bookName, versionId);
    if (!bookSlug) {
      throw new Error(`Book "${bookName}" not found`);
    }
    
    let verses: BibleVerse[] = [];
    let chapter: number;
    
    if (chapterVersePart.includes(":")) {
      // It's a specific verse or range
      const [chapterStr, verseRange] = chapterVersePart.split(":");
      chapter = parseInt(chapterStr, 10);
      
      if (isNaN(chapter)) {
        throw new Error(`Invalid chapter number: ${chapterStr}`);
      }
      
      if (verseRange.includes("-")) {
        // It's a verse range
        const [startVerse, endVerse] = verseRange.split("-").map(v => parseInt(v, 10));
        verses = await fetchVerseRange(bookName, chapter, startVerse, endVerse, versionId);
      } else {
        // It's a single verse
        const verse = parseInt(verseRange, 10);
        const verseData = await fetchVerse(bookName, chapter, verse, versionId);
        if (verseData) verses = [verseData];
      }
    } else {
      // It's a whole chapter
      chapter = parseInt(chapterVersePart, 10);
      
      if (isNaN(chapter)) {
        throw new Error(`Invalid chapter number: ${chapterVersePart}`);
      }
      
      const chapterData = await fetchFromApi(`/bibles/${versionId}/books/${bookSlug}/chapters/${chapter}.json`);
      verses = parseVersesFromChapterJSON(chapterData, bookName, chapter);
    }
    
    return {
      passage: verses,
      reference: reference,
    };
  } catch (error: any) {
    console.error("Error fetching Bible passage:", error);
    toast.error("Failed to load Bible passage", {
      description: error.message || "Please try again later"
    });
    return {
      passage: [],
      reference: reference,
      error: error.message
    };
  }
};
