
import { toast } from "sonner";
import { 
  DEFAULT_BIBLE_VERSION,
  fetchPassageFromApi,
  getBibleVersions as getApiVersions,
} from "./bibleApi";

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
  const bookMatch = reference.match(/^(\d?\s?[A-Za-z]+\s*[A-Za-z]*)/);
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

// Fetch Bible passage using the Bible API
export const fetchBiblePassage = async (
  reference: string, 
  versionId: string = DEFAULT_BIBLE_VERSION
): Promise<BiblePassageResponse> => {
  try {
    const response = await fetchPassageFromApi(reference, versionId);
    
    // Show toast only if there's an error from the API
    if (response.error) {
      toast.error("Bible passage error", {
        description: response.error
      });
    }
    
    return response;
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

// Common Bible books data for offline usage
const commonBibleBooks = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
  "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah",
  "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians",
  "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians",
  "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy",
  "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John", "Jude", "Revelation"
];

// Get available books with fallback
export const getAvailableBooks = async (versionId: string = DEFAULT_BIBLE_VERSION): Promise<string[]> => {
  try {
    // In a real implementation, you would fetch this from the API
    // For now, we'll use the common books array
    return commonBibleBooks;
  } catch (error) {
    console.error("Error fetching Bible books:", error);
    return commonBibleBooks;
  }
};

// Common chapter counts for offline usage
const chapterCounts: Record<string, number> = {
  "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34,
  "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
  "Ezra": 10, "Nehemiah": 13, "Esther": 10, "Job": 42, "Psalms": 150, "Proverbs": 31,
  "Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66, "Jeremiah": 52, "Lamentations": 5,
  "Ezekiel": 48, "Daniel": 12, "Hosea": 14, "Joel": 3, "Amos": 9, "Obadiah": 1, "Jonah": 4,
  "Micah": 7, "Nahum": 3, "Habakkuk": 3, "Zephaniah": 3, "Haggai": 2, "Zechariah": 14, "Malachi": 4,
  "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28, "Romans": 16, "1 Corinthians": 16,
  "2 Corinthians": 13, "Galatians": 6, "Ephesians": 6, "Philippians": 4, "Colossians": 4,
  "1 Thessalonians": 5, "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4,
  "Titus": 3, "Philemon": 1, "Hebrews": 13, "James": 5, "1 Peter": 5, "2 Peter": 3,
  "1 John": 5, "2 John": 1, "3 John": 1, "Jude": 1, "Revelation": 22
};

// Get available chapters with fallback
export const getAvailableChapters = async (
  book: string,
  versionId: string = DEFAULT_BIBLE_VERSION
): Promise<number[]> => {
  try {
    const chapterCount = chapterCounts[book] || 1;
    return Array.from({ length: chapterCount }, (_, i) => i + 1);
  } catch (error) {
    console.error(`Error fetching chapters for ${book}:`, error);
    // Fallback to a reasonable default if the book isn't found
    return [1];
  }
};

// Get available Bible versions with improved reliability
export const getAvailableVersions = async (): Promise<BibleVersion[]> => {
  try {
    const versions = await getApiVersions();
    if (!versions || versions.length === 0) {
      throw new Error("No Bible versions available");
    }
    return versions;
  } catch (error) {
    console.error("Error fetching Bible versions:", error);
    // Return default versions if API fails
    return [
      { id: "de4e12af7f28f599-02", name: "King James Version", abbreviation: "KJV" },
      { id: "06125adad2d5898a-01", name: "English Standard Version", abbreviation: "ESV" },
      { id: "01b29f4b342acc35-01", name: "New International Version", abbreviation: "NIV" },
      { id: "40072c4a5aba4022-01", name: "New American Standard Bible", abbreviation: "NASB" }
    ];
  }
};
