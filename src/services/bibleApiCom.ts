
import { BibleVerse, BiblePassageResponse, BibleVersion } from "./bibleService";
import { toast } from "sonner";

// Bible-API.com constants
export const BIBLE_API_COM_URL = "https://bible-api.com";
export const DEFAULT_BIBLE_API_COM_VERSION = "web"; // Default to World English Bible

// Cache to store responses and improve performance
const cache: Record<string, any> = {};

// Helper function to make API requests with caching
const fetchFromBibleApiCom = async (endpoint: string): Promise<any> => {
  if (cache[endpoint]) {
    return cache[endpoint];
  }

  try {
    console.log(`Fetching from Bible-API.com: ${BIBLE_API_COM_URL}${endpoint}`);
    const response = await fetch(`${BIBLE_API_COM_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(`Bible-API.com Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    cache[endpoint] = data;
    return data;
  } catch (error: any) {
    console.error("Bible-API.com Error:", error);
    throw error;
  }
};

// Parse the Bible-API.com response into our BibleVerse format
const parseBibleApiComResponse = (response: any, reference: string): BibleVerse[] => {
  if (!response || !response.verses || !Array.isArray(response.verses)) {
    throw new Error("Invalid response format from Bible-API.com");
  }

  return response.verses.map((verse: any) => ({
    book_id: verse.book_id.toUpperCase(),
    book_name: verse.book_name,
    chapter: verse.chapter,
    verse: verse.verse,
    text: verse.text.trim()
  }));
};

// Fetch a Bible passage using Bible-API.com
export const fetchPassageFromBibleApiCom = async (
  reference: string,
  versionId: string = DEFAULT_BIBLE_API_COM_VERSION
): Promise<BiblePassageResponse> => {
  try {
    // Format reference for API
    const formattedRef = encodeURIComponent(reference);
    
    // Construct the API endpoint
    let endpoint = `/${formattedRef}`;
    
    // Add translation if specified and different from default
    if (versionId && versionId !== DEFAULT_BIBLE_API_COM_VERSION) {
      endpoint += `?translation=${versionId}`;
    }
    
    console.log(`Fetching Bible-API.com passage with endpoint: ${endpoint}`);
    const response = await fetchFromBibleApiCom(endpoint);
    
    // Parse the response into our standard format
    const verses = parseBibleApiComResponse(response, reference);
    
    return {
      passage: verses,
      reference: response.reference || reference
    };
  } catch (error: any) {
    console.error("Error fetching Bible passage from Bible-API.com:", error);
    
    return {
      passage: [],
      reference: reference,
      error: error.message || "Failed to load Bible passage"
    };
  }
};

// List of available Bible versions on Bible-API.com
export const getBibleApiComVersions = (): BibleVersion[] => {
  return [
    { id: "web", name: "World English Bible", abbreviation: "WEB" },
    { id: "kjv", name: "King James Version", abbreviation: "KJV" },
    { id: "asv", name: "American Standard Version", abbreviation: "ASV" },
    { id: "bbe", name: "Bible in Basic English", abbreviation: "BBE" },
    { id: "webbe", name: "World English Bible (British Edition)", abbreviation: "WEBBE" },
    { id: "oeb-us", name: "Open English Bible (US Edition)", abbreviation: "OEB-US" },
    { id: "oeb-cw", name: "Open English Bible (Commonwealth Edition)", abbreviation: "OEB-CW" },
    { id: "darby", name: "Darby Bible", abbreviation: "DARBY" },
    { id: "ylt", name: "Young's Literal Translation", abbreviation: "YLT" },
    { id: "clementine", name: "Clementine Latin Vulgate", abbreviation: "CLEM" },
    { id: "almeida", name: "João Ferreira de Almeida", abbreviation: "ALMEIDA" },
    { id: "rccv", name: "Romanian Corrected Cornilescu Version", abbreviation: "RCCV" }
  ];
};

// Check if Bible-API.com is available
export const checkBibleApiComStatus = async (): Promise<boolean> => {
  try {
    // Try to fetch a simple verse
    await fetchFromBibleApiCom("/john 3:16");
    return true;
  } catch (error) {
    console.error("Bible-API.com unavailable:", error);
    return false;
  }
};

// Parse a reference string for formatting
export function formatReferenceForBibleApiCom(reference: string): string {
  // Bible-API.com accepts references in a simple format like "john 3:16"
  // So we just need to make sure it's properly formatted
  return reference.trim().toLowerCase();
}
