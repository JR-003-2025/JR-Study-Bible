import { toast } from "sonner";
import kjvData from '../../bible_data/kjv.json';
import asvData from '../../bible_data/asv.json';
import bbeData from '../../bible_data/bbe.json';

type BibleVerse = {
  verse: number;
  text: string;
};

type BibleChapter = {
  chapter: number;
  verses: BibleVerse[];
};

type BibleBook = {
  name: string;
  chapters: BibleChapter[];
};

type BibleData = {
  translation: string;
  books: BibleBook[];
};

const bibleData: Record<string, BibleData> = {
  kjv: kjvData as BibleData,
  asv: asvData as BibleData,
  bbe: bbeData as BibleData
};

export type BibleSearchResult = {
  reference: string;
  text: string;
  version: string;
};

export type BibleRequestParams = {
  task: "exegesis" | "qa" | "sermon" | "search";
  content: string;
  style?: string;
};

export type BibleResponse = {
  text: string;
  error?: string;
  results?: BibleSearchResult[];
};

// Helper function to search through Bible text
const searchBibleText = (version: string, searchTerm: string): BibleSearchResult[] => {
  const results: BibleSearchResult[] = [];
  const data = bibleData[version];
  const searchTermLower = searchTerm.toLowerCase();

  if (!data?.books) return [];

  data.books.forEach(book => {
    book.chapters.forEach(chapter => {
      chapter.verses.forEach(verse => {
        if (verse.text.toLowerCase().includes(searchTermLower)) {
          results.push({
            reference: `${book.name} ${chapter.chapter}:${verse.verse}`,
            text: verse.text,
            version: version.toUpperCase()
          });
        }
      });
    });
  });

  return results;
};

// Helper function to format search results
const formatSearchResults = (results: BibleSearchResult[]): string => {
  if (results.length === 0) return "No results found.";

  return results.map(result => 
    `${result.reference} (${result.version}):\n${result.text}\n`
  ).join('\n');
};

// Main function to handle Bible operations
export const handleBibleRequest = async (
  params: BibleRequestParams
): Promise<BibleResponse> => {
  const { task, content } = params;

  try {
    let response: string = "";
    let results: BibleSearchResult[] = [];

    switch (task) {
      case "search":
        // Search through all versions
        ["kjv", "asv", "bbe"].forEach(version => {
          const versionResults = searchBibleText(version, content);
          results = [...results, ...versionResults];
        });
        response = formatSearchResults(results);
        break;

      case "exegesis":
      case "qa":
      case "sermon":
        // For now, return a message about using local data
        response = `This feature is currently using local Bible data.\nYou searched for: ${content}\n\n`;
        // Add relevant verses from search
        const searchResults = searchBibleText("kjv", content);
        if (searchResults.length > 0) {
          response += "Related verses:\n" + formatSearchResults(searchResults);
        }
        break;
    }

    return {
      text: response,
      results: results.length > 0 ? results : undefined
    };

  } catch (error) {
    console.error("Error in handleBibleRequest:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    toast.error("Failed to process Bible request", {
      description: errorMessage
    });
    
    return {
      text: "",
      error: errorMessage
    };
  }
};
