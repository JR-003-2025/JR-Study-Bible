
import { toast } from "sonner";
import { BibleVerse, BiblePassageResponse } from "./bibleService";

// API.Bible configuration
const API_KEY = "9f59126084a570d8108158ec5ad56802";
const API_URL = "https://api.scripture.api.bible/v1";

// Types for API.Bible responses
type ApiBibleBooksResponse = {
  data: {
    id: string;
    name: string;
    abbreviation: string;
  }[];
};

type ApiBibleChaptersResponse = {
  data: {
    id: string;
    number: string;
    reference: string;
  }[];
};

type ApiBiblePassageResponse = {
  data: {
    id: string;
    orgId: string;
    content: string;
    reference: string;
    verseCount: number;
    copyright: string;
  };
};

type ApiBibleVersionsResponse = {
  data: {
    id: string;
    dblId: string;
    name: string;
    abbreviation: string;
    description: string;
    language: {
      id: string;
      name: string;
    };
  }[];
};

// Cache for API responses
const cache: Record<string, any> = {};

// Helper to make API requests with caching
const fetchFromApi = async (endpoint: string): Promise<any> => {
  if (cache[endpoint]) {
    return cache[endpoint];
  }

  try {
    console.log(`Fetching from API: ${API_URL}${endpoint}`);
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
    toast.error("Error fetching Bible data", {
      description: error.message || "Please try again later",
    });
    throw error;
  }
};

// Default Bible version to use (KJV)
export const DEFAULT_BIBLE_VERSION = "de4e12af7f28f599-02";

// Get available Bible versions
export const getBibleVersions = async (): Promise<{ id: string; name: string; abbreviation: string }[]> => {
  try {
    const response = await fetchFromApi("/bibles");
    return (response as ApiBibleVersionsResponse).data.map((version) => ({
      id: version.id,
      name: version.name,
      abbreviation: version.abbreviation,
    }));
  } catch (error) {
    console.error("Error fetching Bible versions:", error);
    return [];
  }
};

// Get books for a specific Bible version
export const getBooksForVersion = async (versionId: string = DEFAULT_BIBLE_VERSION): Promise<string[]> => {
  try {
    const response = await fetchFromApi(`/bibles/${versionId}/books`);
    return (response as ApiBibleBooksResponse).data.map((book) => book.name);
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
    // First we need to find the book ID
    const booksResponse = await fetchFromApi(`/bibles/${versionId}/books`);
    const bookData = (booksResponse as ApiBibleBooksResponse).data.find(
      (b) => b.name.toLowerCase() === book.toLowerCase()
    );

    if (!bookData) {
      throw new Error(`Book "${book}" not found`);
    }

    // Then get chapters for that book
    const chaptersResponse = await fetchFromApi(`/bibles/${versionId}/books/${bookData.id}/chapters`);
    return (chaptersResponse as ApiBibleChaptersResponse).data
      .filter((chapter) => chapter.number !== "intro") // Filter out intro chapters
      .map((chapter) => {
        const chapterNum = parseInt(chapter.number, 10);
        return isNaN(chapterNum) ? 0 : chapterNum;  // Ensure we return valid numbers only
      })
      .filter(num => num > 0);  // Filter out any zeros that might have come from invalid numbers
  } catch (error) {
    console.error(`Error fetching chapters for ${book}:`, error);
    return [];
  }
};

// Parse HTML content from API.Bible to extract verses
const parseVersesFromHTML = (htmlContent: string, bookName: string, chapter: number): BibleVerse[] => {
  const verses: BibleVerse[] = [];
  
  // Simple regex to extract verse numbers and text from the HTML
  const verseRegex = /<span data-number="(\d+)".*?class="verse">(.*?)<\/span>/g;
  let match;
  
  // Generate a book_id from the book name
  const book_id = bookName.substring(0, 3).toUpperCase();
  
  while ((match = verseRegex.exec(htmlContent)) !== null) {
    const verseNumber = parseInt(match[1], 10);
    // Replace HTML tags and clean up text
    let text = match[2].replace(/<\/?[^>]+(>|$)/g, "").trim();
    
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

// Get the correct book ID for API.Bible
const getBookId = async (bookName: string, versionId: string): Promise<string | null> => {
  try {
    const booksResponse = await fetchFromApi(`/bibles/${versionId}/books`);
    const books = (booksResponse as ApiBibleBooksResponse).data;
    
    // First try exact match
    const exactMatch = books.find(b => b.name.toLowerCase() === bookName.toLowerCase());
    if (exactMatch) return exactMatch.id;
    
    // Try abbreviation match
    const abbrMatch = books.find(b => b.abbreviation.toLowerCase() === bookName.toLowerCase());
    if (abbrMatch) return abbrMatch.id;
    
    // Try partial match
    const partialMatch = books.find(b => 
      b.name.toLowerCase().includes(bookName.toLowerCase()) || 
      bookName.toLowerCase().includes(b.abbreviation.toLowerCase())
    );
    if (partialMatch) return partialMatch.id;
    
    return null;
  } catch (error) {
    console.error("Error finding book ID:", error);
    return null;
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
    
    // Find the book ID
    const bookId = await getBookId(bookName, versionId);
    if (!bookId) {
      throw new Error(`Book "${bookName}" not found`);
    }
    
    // Check if it's a whole chapter or specific verses
    let endpoint;
    let chapter: number;
    
    if (chapterVersePart.includes(":")) {
      // It's a specific verse or range - use the verses endpoint
      const [chapterStr, verseRange] = chapterVersePart.split(":");
      chapter = parseInt(chapterStr, 10);
      
      if (isNaN(chapter)) {
        throw new Error(`Invalid chapter number: ${chapterStr}`);
      }
      
      endpoint = `/bibles/${versionId}/verses/${bookId}.${chapter}.${verseRange}?content-type=html&include-notes=false`;
    } else {
      // It's a whole chapter - use the chapters endpoint
      chapter = parseInt(chapterVersePart, 10);
      
      if (isNaN(chapter)) {
        throw new Error(`Invalid chapter number: ${chapterVersePart}`);
      }
      
      endpoint = `/bibles/${versionId}/chapters/${bookId}.${chapter}?content-type=html&include-notes=false`;
    }
    
    console.log(`Fetching passage with endpoint: ${endpoint}`);
    const response = await fetchFromApi(endpoint);
    
    // Parse verses from HTML content
    const passageData = response.data;
    const verses = parseVersesFromHTML(passageData.content, bookName, chapter);
    
    return {
      passage: verses,
      reference: passageData.reference,
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
