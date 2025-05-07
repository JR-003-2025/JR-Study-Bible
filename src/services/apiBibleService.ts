
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
      .map((chapter) => parseInt(chapter.number, 10));
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

// Get a Bible passage by reference
export const fetchPassageFromApi = async (
  reference: string,
  versionId: string = DEFAULT_BIBLE_VERSION
): Promise<BiblePassageResponse> => {
  try {
    // Handle special case for whole chapters
    const isWholeChapter = !reference.includes(":");
    let formattedRef = reference;
    
    // Format reference for API.Bible
    if (isWholeChapter) {
      // If just a chapter reference, we need to get all verses
      const [book, chapter] = reference.split(" ");
      if (book && chapter) {
        formattedRef = `${book} ${chapter}`;
      }
    }
    
    // Create a clean API-friendly reference
    const apiRef = encodeURIComponent(formattedRef);
    
    // Fetch passage
    const response = await fetchFromApi(`/bibles/${versionId}/passages/${apiRef}?content-type=html&include-notes=false`);
    const passageData = response.data;
    
    // Parse book and chapter from reference
    const refParts = formattedRef.split(" ");
    const chapterPart = refParts[refParts.length - 1].split(":")[0];
    const chapter = parseInt(chapterPart, 10);
    const bookName = refParts.slice(0, -1).join(" ");
    
    // Parse verses from HTML content
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
