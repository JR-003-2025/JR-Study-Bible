
import { BibleVerse, BiblePassageResponse, BibleVersion } from "./bibleService";
import { toast } from "sonner";

// YouVersion API constants
export const YOUVERSION_API_URL = "https://youversion-api.herokuapp.com/api/v1";
export const DEFAULT_YOUVERSION_VERSION = "NIV"; // Default to NIV

// Cache to store responses and improve performance
const cache: Record<string, any> = {};

// Helper function to make API requests with caching
const fetchFromYouVersionApi = async (endpoint: string): Promise<any> => {
  if (cache[endpoint]) {
    return cache[endpoint];
  }

  try {
    console.log(`Fetching from YouVersion API: ${YOUVERSION_API_URL}${endpoint}`);
    const response = await fetch(`${YOUVERSION_API_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(`YouVersion API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    cache[endpoint] = data;
    return data;
  } catch (error: any) {
    console.error("YouVersion API Error:", error);
    throw error;
  }
};

// Check if the YouVersion API is available
export const checkYouVersionApiStatus = async (): Promise<boolean> => {
  try {
    await fetch(`${YOUVERSION_API_URL}/status`);
    return true;
  } catch (error) {
    console.error("YouVersion API unavailable:", error);
    return false;
  }
};

// Parse the YouVersion API response into our BibleVerse format
const parseYouVersionResponse = (response: any, reference: string): BibleVerse[] => {
  if (!response || !response.passage || !response.citation) {
    throw new Error("Invalid response format from YouVersion API");
  }

  // Extract book, chapter, verses from citation
  const parts = response.citation.split(" ");
  let version = parts[parts.length - 1];
  let referenceText = parts.slice(0, -1).join(" ");
  let bookName = referenceText.split(" ")[0];
  
  // Handle multi-word book names (e.g., "1 John")
  if (/^\d/.test(bookName) && parts.length > 2) {
    bookName = parts.slice(0, 2).join(" ");
  }

  // Extract chapter and verse information
  const chapterVerseMatch = referenceText.match(/(\d+):(\d+)(?:-(\d+))?/);
  const chapter = chapterVerseMatch ? parseInt(chapterVerseMatch[1], 10) : 1;
  const verseStart = chapterVerseMatch ? parseInt(chapterVerseMatch[2], 10) : 1;
  const verseEnd = chapterVerseMatch && chapterVerseMatch[3] 
    ? parseInt(chapterVerseMatch[3], 10) 
    : verseStart;

  // For multi-verse responses, we need to split the text
  const verses: BibleVerse[] = [];
  const book_id = bookName.substring(0, 3).toUpperCase();

  // If this is a single verse
  if (verseStart === verseEnd) {
    verses.push({
      book_id,
      book_name: bookName,
      chapter,
      verse: verseStart,
      text: response.passage
    });
  } 
  // For multiple verses, we need a simple splitting strategy
  // This is an approximation since YouVersion API doesn't separate individual verses
  else {
    const text = response.passage;
    // Create one verse per number in the range
    for (let i = verseStart; i <= verseEnd; i++) {
      verses.push({
        book_id,
        book_name: bookName,
        chapter,
        verse: i,
        text: text
      });
    }
  }

  return verses;
};

// Fetch a Bible passage using YouVersion API
export const fetchPassageFromYouVersion = async (
  reference: string,
  versionId: string = DEFAULT_YOUVERSION_VERSION
): Promise<BiblePassageResponse> => {
  try {
    // Parse the reference for API parameters
    const { book, chapter, verseStart, verseEnd } = parseReferenceForYouVersion(reference);
    
    let endpoint = `/verse?book=${book}`;
    
    // Add chapter if specified
    if (chapter > 1) {
      endpoint += `&chapter=${chapter}`;
    }
    
    // Add verses if specified
    if (verseStart) {
      if (verseEnd && verseEnd > verseStart) {
        endpoint += `&verses=${verseStart}-${verseEnd}`;
      } else {
        endpoint += `&verses=${verseStart}`;
      }
    }
    
    // Add version if specified and different from default
    if (versionId && versionId !== DEFAULT_YOUVERSION_VERSION) {
      endpoint += `&version=${versionId}`;
    }
    
    console.log(`Fetching YouVersion passage with endpoint: ${endpoint}`);
    const response = await fetchFromYouVersionApi(endpoint);
    
    // Parse the response into our standard format
    const verses = parseYouVersionResponse(response, reference);
    
    return {
      passage: verses,
      reference: response.citation || reference
    };
  } catch (error: any) {
    console.error("Error fetching Bible passage from YouVersion:", error);
    return {
      passage: [],
      reference: reference,
      error: error.message || "Failed to load Bible passage"
    };
  }
};

// Common YouVersion Bible versions
export const getYouVersionBibleVersions = (): BibleVersion[] => {
  return [
    { id: "NIV", name: "New International Version", abbreviation: "NIV" },
    { id: "KJV", name: "King James Version", abbreviation: "KJV" },
    { id: "NLT", name: "New Living Translation", abbreviation: "NLT" },
    { id: "ESV", name: "English Standard Version", abbreviation: "ESV" },
    { id: "NASB", name: "New American Standard Bible", abbreviation: "NASB" },
    { id: "CSB", name: "Christian Standard Bible", abbreviation: "CSB" },
    { id: "NKJV", name: "New King James Version", abbreviation: "NKJV" },
    { id: "MSG", name: "The Message", abbreviation: "MSG" },
    { id: "AMP", name: "Amplified Bible", abbreviation: "AMP" },
    { id: "NRSV", name: "New Revised Standard Version", abbreviation: "NRSV" }
  ];
};

// Parse a reference string for YouVersion API
export function parseReferenceForYouVersion(reference: string): { 
  book: string; 
  chapter: number; 
  verseStart?: number; 
  verseEnd?: number 
} {
  // Extract book name (everything before the first number)
  const bookMatch = reference.match(/^(\d?\s?[A-Za-z]+\s*[A-Za-z]*)/);
  const book = bookMatch ? encodeURIComponent(bookMatch[0].trim()) : "John";
  
  // Extract chapter and verse references with improved regex
  const numberMatch = reference.match(/(\d+)(?::(\d+))?(?:-(\d+))?/);
  
  if (!numberMatch) {
    return { book, chapter: 1 };
  }
  
  const chapter = parseInt(numberMatch[1], 10) || 1;
  const verseStart = numberMatch[2] ? parseInt(numberMatch[2], 10) : undefined;
  const verseEnd = numberMatch[3] ? parseInt(numberMatch[3], 10) : undefined;
  
  return { book, chapter, verseStart, verseEnd };
}
