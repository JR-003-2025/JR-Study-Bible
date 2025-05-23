// Types for Bible JSON structure
export interface BibleVerse {
  verse: number;
  text: string;
}

export interface BibleChapter {
  chapter: number;
  verses: BibleVerse[];
}

export interface BibleBook {
  name: string;
  chapters: BibleChapter[];
}

export interface BibleData {
  translation: string;
  books: BibleBook[];
}

// API Response Types
export interface BiblePassageVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BiblePassageResponse {
  passage: BiblePassageVerse[];
  reference: string;
  error?: string;
}

export interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
}
