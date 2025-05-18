import { toast } from "sonner";

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

export type BibleApiProvider = "youversion" | "api.bible";

// API.Bible configuration
const API_KEY = "9f59126084a570d8108158ec5ad56802";
const API_URL = "https://api.scripture.api.bible/v1";
export const DEFAULT_VERSION = "de4e12af7f28f599-02"; // KJV

// Store the current API provider
let currentApiProvider: BibleApiProvider = "api.bible";

// Function to set the Bible API provider
export function setBibleApiProvider(provider: BibleApiProvider) {
  currentApiProvider = provider;
  // Clear cache when switching providers
  Object.keys(cache).forEach(key => delete cache[key]);
}

// Function to get the current Bible API provider
export function getBibleApiProvider(): BibleApiProvider {
  return currentApiProvider;
}

// Function to get the default version ID based on the current provider
export function getDefaultVersionId(): string {
  return currentApiProvider === "youversion" 
    ? "01b29f4b342acc35-01" // NIV for YouVersion
    : DEFAULT_VERSION; // KJV for API.Bible
}

// Function to detect CORS issues with YouVersion API
export async function detectYouVersionCorsIssue(): Promise<boolean> {
  try {
    const response = await fetch("https://www.youversion.com/api/v1/versions", {
      method: "HEAD"
    });
    return true; // No CORS issues
  } catch (error) {
    return false; // CORS issues detected
  }
}

// Function to check if a version ID is from YouVersion
export function isYouVersionId(versionId: string): boolean {
  return versionId.startsWith("YV_");
}

// Cache for API responses
const cache: Record<string, any> = {};

// Helper to make API requests with caching
const fetchFromApi = async (endpoint: string): Promise<any> => {
  if (cache[endpoint]) {
    return cache[endpoint];
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "api-key": API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    cache[endpoint] = data;
    return data;
  } catch (error: any) {
    console.error("API.Bible Error:", error);
    throw error;
  }
};

// Parse HTML content to extract verses
const parseVersesFromHTML = (htmlContent: string, bookName: string, chapter: number): BibleVerse[] => {
  const verses: BibleVerse[] = [];
  const verseRegex = /<span data-number="(\d+)".*?class="verse".*?>(.*?)<\/span>/g;
  const book_id = bookName.substring(0, 3).toUpperCase();
  
  let match;
  while ((match = verseRegex.exec(htmlContent)) !== null) {
    const verseNumber = parseInt(match[1], 10);
    let text = match[2]
      .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ")        // Replace HTML entities
      .replace(/\s+/g, " ")           // Normalize whitespace
      .trim();
    
    verses.push({
      book_id,
      book_name: bookName,
      chapter,
      verse: verseNumber,
      text,
    });
  }
  
  return verses;
};

// Get available Bible versions
export const getAvailableVersions = async (): Promise<BibleVersion[]> => {
  try {
    const response = await fetchFromApi("/bibles");
    return response.data.map((version: any) => ({
      id: version.id,
      name: version.name,
      abbreviation: version.abbreviation || version.id.substring(0, 3).toUpperCase(),
    }));
  } catch (error) {
    console.error("Error fetching Bible versions:", error);
    return defaultBibleVersions();
  }
};

// Get available books
export const getAvailableBooks = async (versionId: string = DEFAULT_VERSION): Promise<string[]> => {
  try {
    const response = await fetchFromApi(`/bibles/${versionId}/books`);
    return response.data.map((book: any) => book.name);
  } catch (error) {
    console.error("Error fetching Bible books:", error);
    return [];
  }
};

// Get available chapters for a book
export const getAvailableChapters = async (
  book: string,
  versionId: string = DEFAULT_VERSION
): Promise<number[]> => {
  try {
    const booksResponse = await fetchFromApi(`/bibles/${versionId}/books`);
    const bookData = booksResponse.data.find(
      (b: any) => b.name.toLowerCase() === book.toLowerCase()
    );

    if (!bookData) {
      throw new Error(`Book "${book}" not found`);
    }

    const chaptersResponse = await fetchFromApi(`/bibles/${versionId}/books/${bookData.id}/chapters`);
    return chaptersResponse.data
      .filter((chapter: any) => chapter.number !== "intro")
      .map((chapter: any) => parseInt(chapter.number, 10))
      .filter((num: number) => !isNaN(num));
  } catch (error) {
    console.error(`Error fetching chapters for ${book}:`, error);
    return [];
  }
};

// Fetch a Bible passage
export const fetchBiblePassage = async (
  reference: string,
  versionId: string = DEFAULT_VERSION
): Promise<BiblePassageResponse> => {
  try {
    const { bookName, chapter, verseStart, verseEnd } = parseReference(reference);
    
    // Find the book ID
    const booksResponse = await fetchFromApi(`/bibles/${versionId}/books`);
    const bookData = booksResponse.data.find(
      (b: any) => b.name.toLowerCase() === bookName.toLowerCase()
    );

    if (!bookData) {
      throw new Error(`Book "${bookName}" not found`);
    }

    let endpoint;
    if (verseStart) {
      // Specific verse or range
      endpoint = verseEnd
        ? `/bibles/${versionId}/passages/${bookData.id}.${chapter}.${verseStart}-${verseEnd}`
        : `/bibles/${versionId}/verses/${bookData.id}.${chapter}.${verseStart}`;
    } else {
      // Whole chapter
      endpoint = `/bibles/${versionId}/chapters/${bookData.id}.${chapter}`;
    }

    endpoint += "?content-type=html&include-notes=false&include-verse-numbers=true";
    
    const response = await fetchFromApi(endpoint);
    const verses = parseVersesFromHTML(response.data.content, bookName, chapter);

    if (verses.length === 0) {
      throw new Error(`No verses found for "${reference}"`);
    }

    return {
      passage: verses,
      reference: response.data.reference || reference
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

// Parse a Bible reference
export const parseReference = (reference: string): { 
  bookName: string; 
  chapter: number; 
  verseStart?: number; 
  verseEnd?: number 
} => {
  const parts = reference.split(" ");
  if (parts.length < 2) {
    throw new Error("Invalid reference format. Expected 'Book Chapter:Verse'");
  }
  
  const chapterVersePart = parts[parts.length - 1];
  const bookName = parts.slice(0, parts.length - 1).join(" ");
  
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
    } else {
      verseStart = parseInt(verseRange, 10);
    }
  } else {
    chapter = parseInt(chapterVersePart, 10);
  }
  
  if (isNaN(chapter)) {
    throw new Error("Invalid chapter number");
  }
  
  return { bookName, chapter, verseStart, verseEnd };
};

// Default Bible versions for fallback
function defaultBibleVersions(): BibleVersion[] {
  return [
    { id: "de4e12af7f28f599-02", name: "King James Version", abbreviation: "KJV" },
    { id: "06125adad2d5898a-01", name: "English Standard Version", abbreviation: "ESV" },
    { id: "01b29f4b342acc35-01", name: "New International Version", abbreviation: "NIV" },
    { id: "40072c4a5aba4022-01", name: "New American Standard Bible", abbreviation: "NASB" }
  ];
}