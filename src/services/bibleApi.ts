
// src/services/bibleApi.ts
import { BiblePassageResponse, BibleVerse, BibleVersion } from "./bibleService";
import { toast } from "sonner";

export const BASE_URL = "https://api.scripture.api.bible/v1";
export const API_KEY = "9f59126084a570d8108158ec5ad56802"; // API.Bible key

// Cache for API responses to improve performance
const cache: Record<string, any> = {};

// Helper to make API requests with caching
const fetchFromApi = async (endpoint: string): Promise<any> => {
  if (cache[endpoint]) {
    return cache[endpoint];
  }

  try {
    console.log(`Fetching from API: ${BASE_URL}${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
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
    // Don't toast from here, let the calling function handle UI notifications
    throw error;
  }
};

// Default Bible version to use (KJV)
export const DEFAULT_BIBLE_VERSION = "de4e12af7f28f599-02";

// Get available Bible versions with improved error handling
export async function getBibleVersions(): Promise<BibleVersion[]> {
  try {
    const response = await fetchFromApi("/bibles");
    if (!response?.data || !Array.isArray(response.data)) {
      console.warn("Invalid Bible versions response:", response);
      return defaultBibleVersions();
    }
    
    return response.data.map((version: any) => ({
      id: version.id,
      name: version.name,
      abbreviation: version.abbreviation || version.id.substring(0, 3).toUpperCase(),
    }));
  } catch (error) {
    console.error("Error fetching Bible versions:", error);
    return defaultBibleVersions();
  }
}

// Parse HTML content from API.Bible to extract verses
export const parseVersesFromHTML = (htmlContent: string, bookName: string, chapter: number): BibleVerse[] => {
  const verses: BibleVerse[] = [];
  
  // Use a more robust regex to extract verse numbers and text from HTML
  const verseRegex = /<span data-number="(\d+)".*?class="verse".*?>(.*?)(?=<span data-number|$)/gs;
  let match;
  
  // Generate a book_id from the book name
  const book_id = bookName.substring(0, 3).toUpperCase();
  
  while ((match = verseRegex.exec(htmlContent)) !== null) {
    const verseNumber = parseInt(match[1], 10);
    // Replace HTML tags and clean up text
    let text = match[2].replace(/<\/?[^>]+(>|$)/g, "").trim();
    
    // Handle special characters and formatting
    text = text.replace(/&nbsp;/g, " ")
               .replace(/&quot;/g, '"')
               .replace(/&amp;/g, "&")
               .replace(/\s+/g, " ");
    
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

// Get a Bible passage by reference with enhanced error handling
export const fetchPassageFromApi = async (
  reference: string,
  versionId: string = DEFAULT_BIBLE_VERSION
): Promise<BiblePassageResponse> => {
  try {
    // Parse the reference parts
    const { bookName, chapter, verseStart, verseEnd } = parseReferenceForApi(reference);
    
    // Find the book ID
    const bookId = await getBookId(bookName, versionId);
    if (!bookId) {
      throw new Error(`Book "${bookName}" not found`);
    }
    
    // Set up the endpoint based on whether it's a chapter or specific verses
    let endpoint: string;
    
    if (verseStart) {
      // It's a specific verse or range
      if (verseEnd) {
        endpoint = `/bibles/${versionId}/passages/${bookId}.${chapter}.${verseStart}-${verseEnd}?content-type=html&include-notes=false`;
      } else {
        endpoint = `/bibles/${versionId}/verses/${bookId}.${chapter}.${verseStart}?content-type=html&include-notes=false`;
      }
    } else {
      // It's a whole chapter
      endpoint = `/bibles/${versionId}/chapters/${bookId}.${chapter}?content-type=html&include-notes=false`;
    }
    
    console.log(`Fetching passage with endpoint: ${endpoint}`);
    const response = await fetchFromApi(endpoint);
    
    if (!response.data || !response.data.content) {
      throw new Error("Invalid passage response");
    }
    
    // Parse verses from HTML content
    const passageData = response.data;
    const verses = parseVersesFromHTML(passageData.content, bookName, chapter);
    
    if (verses.length === 0) {
      throw new Error(`No verses found for "${reference}"`);
    }
    
    return {
      passage: verses,
      reference: passageData.reference || reference,
    };
  } catch (error: any) {
    console.error("Error fetching Bible passage:", error);
    return {
      passage: [],
      reference: reference,
      error: error.message || "Failed to load Bible passage"
    };
  }
};

// Get the correct book ID for API.Bible with improved matching
export const getBookId = async (bookName: string, versionId: string): Promise<string | null> => {
  try {
    const booksResponse = await fetchFromApi(`/bibles/${versionId}/books`);
    if (!booksResponse?.data || !Array.isArray(booksResponse.data)) {
      throw new Error("Invalid books response");
    }
    
    const books = booksResponse.data;
    
    // First try exact match (case insensitive)
    const exactMatch = books.find(b => 
      b.name.toLowerCase() === bookName.toLowerCase() ||
      b.nameLong?.toLowerCase() === bookName.toLowerCase()
    );
    if (exactMatch) return exactMatch.id;
    
    // Try abbreviation match
    const abbrMatch = books.find(b => 
      b.abbreviation?.toLowerCase() === bookName.toLowerCase()
    );
    if (abbrMatch) return abbrMatch.id;
    
    // Try partial match with stronger criteria
    const partialMatches = books.filter(b => 
      b.name.toLowerCase().includes(bookName.toLowerCase()) || 
      bookName.toLowerCase().includes(b.name.toLowerCase()) ||
      (b.nameLong && b.nameLong.toLowerCase().includes(bookName.toLowerCase()))
    );
    
    // If multiple partial matches, choose the shortest one
    // (likely to be the most precise match)
    if (partialMatches.length > 0) {
      return partialMatches.sort((a, b) => a.name.length - b.name.length)[0].id;
    }
    
    return null;
  } catch (error) {
    console.error("Error finding book ID:", error);
    return null;
  }
};

// Parse a reference string for API.Bible with improved parsing
export function parseReferenceForApi(reference: string): { 
  bookName: string; 
  chapter: number; 
  verseStart?: number; 
  verseEnd?: number 
} {
  // Extract book name (everything before the first number)
  const bookMatch = reference.match(/^(\d?\s?[A-Za-z]+\s*[A-Za-z]*)/);
  const bookName = bookMatch ? bookMatch[0].trim() : "Genesis";
  
  // Extract chapter and verse references with improved regex
  const numberMatch = reference.match(/(\d+)(?::(\d+))?(?:-(\d+))?/);
  
  if (!numberMatch) {
    return { bookName, chapter: 1 };
  }
  
  const chapter = parseInt(numberMatch[1], 10) || 1;
  const verseStart = numberMatch[2] ? parseInt(numberMatch[2], 10) : undefined;
  const verseEnd = numberMatch[3] ? parseInt(numberMatch[3], 10) : undefined;
  
  return { bookName, chapter, verseStart, verseEnd };
}

// Default Bible versions to use when API fails
export function defaultBibleVersions(): BibleVersion[] {
  return [
    { id: "de4e12af7f28f599-02", name: "King James Version", abbreviation: "KJV" },
    { id: "06125adad2d5898a-01", name: "English Standard Version", abbreviation: "ESV" },
    { id: "01b29f4b342acc35-01", name: "New International Version", abbreviation: "NIV" },
    { id: "40072c4a5aba4022-01", name: "New American Standard Bible", abbreviation: "NASB" }
  ];
}

// Method for the App Bible API
export async function fetchPassageFromNewApi(
  reference: string,
  versionId: string = DEFAULT_BIBLE_VERSION
): Promise<BiblePassageResponse> {
  // Attempt to use the API.Bible integration first
  try {
    return await fetchPassageFromApi(reference, versionId);
  } catch (error) {
    console.error("Primary API failed, trying fallback...", error);
    return fallbackFetchPassage(reference);
  }
}

// Fallback method to handle API failures
async function fallbackFetchPassage(reference: string): Promise<BiblePassageResponse> {
  // This is a very simplified fallback implementation
  // In a real app, you might want to implement a more robust solution
  const { bookName, chapter, verseStart, verseEnd } = parseReferenceForApi(reference);
  
  return {
    passage: [{
      book_id: bookName.substring(0, 3).toUpperCase(),
      book_name: bookName,
      chapter: chapter,
      verse: verseStart || 1,
      text: `API unavailable. Please try again later. (${reference})`
    }],
    reference: reference,
    error: "API is temporarily unavailable. Using fallback content."
  };
}
