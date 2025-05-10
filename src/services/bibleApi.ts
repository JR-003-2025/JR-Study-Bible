
// src/services/bibleApi.ts
import { BiblePassageResponse, BibleVerse, BibleVersion } from "./bibleService";

export const BASE_URL = "https://bible.helloao.org/api";

export async function getAvailableTranslations(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/available_translations.json`);
  return res.json();
}

export async function getBooks(translation: string): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/${translation}/books.json`);
  return res.json();
}

export async function getChapter(translation: string, book: string, chapter: number): Promise<any> {
  const res = await fetch(`${BASE_URL}/${translation}/${book}/${chapter}.json`);
  return res.json();
}

// Helper function to format the API response to match our existing BiblePassageResponse format
export async function fetchPassageFromNewApi(
  reference: string,
  versionId: string = "eng_kjv"
): Promise<BiblePassageResponse> {
  try {
    // Parse the reference to extract book, chapter, and verses
    const { bookCode, chapter, verseStart, verseEnd } = parseReferenceForNewApi(reference);
    
    // Fetch the chapter data
    const chapterData = await getChapter(versionId, bookCode, chapter);
    
    if (!chapterData || !chapterData.verses) {
      return {
        passage: [],
        reference: reference,
        error: "Failed to load passage"
      };
    }
    
    // Filter verses if specific verses were requested
    let verses = chapterData.verses;
    if (verseStart) {
      if (verseEnd) {
        // Range of verses
        verses = verses.filter((v: any) => 
          v.verse >= verseStart && v.verse <= verseEnd
        );
      } else {
        // Single verse
        verses = verses.filter((v: any) => v.verse === verseStart);
      }
    }
    
    // Format the verses to match our BibleVerse format
    const formattedVerses: BibleVerse[] = verses.map((v: any) => ({
      book_id: bookCode,
      book_name: chapterData.book_name || bookCode,
      chapter: chapter,
      verse: v.verse,
      text: v.text
    }));
    
    return {
      passage: formattedVerses,
      reference: `${chapterData.book_name || bookCode} ${chapter}${verseStart ? `:${verseStart}${verseEnd ? `-${verseEnd}` : ""}` : ""}`
    };
  } catch (error) {
    console.error("Error fetching passage from new API:", error);
    return {
      passage: [],
      reference: reference,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

// Parse a reference string like "John 3:16" to get the book, chapter, and verse info
function parseReferenceForNewApi(reference: string): { 
  bookCode: string; 
  chapter: number; 
  verseStart?: number; 
  verseEnd?: number 
} {
  // Extract book name (everything before the first number)
  const bookMatch = reference.match(/^(\d?\s?[A-Za-z]+)/);
  let bookName = bookMatch ? bookMatch[0].trim() : "GEN"; // Default to Genesis
  
  // Convert book name to book code (short form)
  const bookCode = convertBookNameToCode(bookName);
  
  // Extract chapter and verse references
  const numberMatch = reference.match(/(\d+)(?::(\d+))?(?:-(\d+))?/);
  
  if (!numberMatch) {
    return { bookCode, chapter: 1 };
  }
  
  const chapter = parseInt(numberMatch[1], 10);
  const verseStart = numberMatch[2] ? parseInt(numberMatch[2], 10) : undefined;
  const verseEnd = numberMatch[3] ? parseInt(numberMatch[3], 10) : undefined;
  
  return { bookCode, chapter, verseStart, verseEnd };
}

// Convert common book names to book codes used by the API
function convertBookNameToCode(bookName: string): string {
  // This is a simplified mapping - you might need to expand this based on the API's requirements
  const bookMap: Record<string, string> = {
    "Genesis": "GEN",
    "Exodus": "EXO",
    "Leviticus": "LEV",
    "Numbers": "NUM",
    "Deuteronomy": "DEU",
    "Joshua": "JOS",
    "Judges": "JDG",
    "Ruth": "RUT",
    "1 Samuel": "1SA",
    "2 Samuel": "2SA",
    "1 Kings": "1KI",
    "2 Kings": "2KI",
    "1 Chronicles": "1CH",
    "2 Chronicles": "2CH",
    "Ezra": "EZR",
    "Nehemiah": "NEH",
    "Esther": "EST",
    "Job": "JOB",
    "Psalms": "PSA",
    "Psalm": "PSA",
    "Proverbs": "PRO",
    "Ecclesiastes": "ECC",
    "Song of Solomon": "SNG",
    "Isaiah": "ISA",
    "Jeremiah": "JER",
    "Lamentations": "LAM",
    "Ezekiel": "EZK",
    "Daniel": "DAN",
    "Hosea": "HOS",
    "Joel": "JOL",
    "Amos": "AMO",
    "Obadiah": "OBA",
    "Jonah": "JON",
    "Micah": "MIC",
    "Nahum": "NAH",
    "Habakkuk": "HAB",
    "Zephaniah": "ZEP",
    "Haggai": "HAG",
    "Zechariah": "ZEC",
    "Malachi": "MAL",
    "Matthew": "MAT",
    "Mark": "MRK",
    "Luke": "LUK",
    "John": "JHN",
    "Acts": "ACT",
    "Romans": "ROM",
    "1 Corinthians": "1CO",
    "2 Corinthians": "2CO",
    "Galatians": "GAL",
    "Ephesians": "EPH",
    "Philippians": "PHP",
    "Colossians": "COL",
    "1 Thessalonians": "1TH",
    "2 Thessalonians": "2TH",
    "1 Timothy": "1TI",
    "2 Timothy": "2TI",
    "Titus": "TIT",
    "Philemon": "PHM",
    "Hebrews": "HEB",
    "James": "JAS",
    "1 Peter": "1PE",
    "2 Peter": "2PE",
    "1 John": "1JN",
    "2 John": "2JN",
    "3 John": "3JN",
    "Jude": "JUD",
    "Revelation": "REV"
  };

  // Try to match the book name directly
  let code = bookMap[bookName];
  
  if (code) return code;
  
  // If not found, try to match the book name case-insensitively
  for (const [name, bookCode] of Object.entries(bookMap)) {
    if (name.toLowerCase() === bookName.toLowerCase()) {
      return bookCode;
    }
  }
  
  // If still not found, check if it starts with the book name (abbreviated form)
  for (const [name, bookCode] of Object.entries(bookMap)) {
    if (name.toLowerCase().startsWith(bookName.toLowerCase())) {
      return bookCode;
    }
  }
  
  // Default to Genesis if no match found
  return "GEN";
}

// Map translation codes to version IDs
export const translationToVersionMap: Record<string, string> = {
  "eng_kjv": "en-KJV",
  "eng_web": "en-WEB",
  "eng_bbe": "en-BBE",
  "eng_asv": "en-ASV",
  // Add more mappings as needed
};

// Get the available Bible versions
export async function getBibleVersions(): Promise<BibleVersion[]> {
  try {
    const translations = await getAvailableTranslations();
    
    // Ensure the translations response is an array
    if (!Array.isArray(translations)) {
      console.warn("Translations data is not an array:", translations);
      return [
        { id: "eng_kjv", name: "King James Version", abbreviation: "KJV" },
        { id: "eng_web", name: "World English Bible", abbreviation: "WEB" }
      ];
    }
    
    return translations.map((t: any) => ({
      id: t.id || t.code,
      name: t.name,
      abbreviation: t.abbreviation || t.id || t.code
    }));
  } catch (error) {
    console.error("Error fetching Bible versions:", error);
    return [
      { id: "eng_kjv", name: "King James Version", abbreviation: "KJV" },
      { id: "eng_web", name: "World English Bible", abbreviation: "WEB" }
    ];
  }
}

// Default translation
export const DEFAULT_BIBLE_VERSION = "eng_kjv";
