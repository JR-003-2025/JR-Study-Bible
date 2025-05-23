import { BibleVerse, BiblePassageResponse, BibleVersion } from './bibleService';
import kjvData from '../../bible_data/kjv.json';
import asvData from '../../bible_data/asv.json';
import bbeData from '../../bible_data/bbe.json';

const bibleVersions: { [key: string]: any } = {
  'kjv': kjvData,
  'asv': asvData,
  'bbe': bbeData
};

export const availableVersions: BibleVersion[] = [
  { id: 'kjv', name: 'King James Version', abbreviation: 'KJV' },
  { id: 'asv', name: 'American Standard Version', abbreviation: 'ASV' },
  { id: 'bbe', name: 'Bible in Basic English', abbreviation: 'BBE' }
];

const normalizeBookName = (book: string): string => {
  // Common abbreviations and their full names
  const bookMappings: { [key: string]: string } = {
    'gen': 'Genesis',
    'exo': 'Exodus',
    'lev': 'Leviticus',
    'num': 'Numbers',
    'deut': 'Deuteronomy',
    'josh': 'Joshua',
    'judg': 'Judges',
    'ruth': 'Ruth',
    '1sam': '1 Samuel',
    '2sam': '2 Samuel',
    '1kings': '1 Kings',
    '2kings': '2 Kings',
    '1chron': '1 Chronicles',
    '2chron': '2 Chronicles',
    'ezra': 'Ezra',
    'neh': 'Nehemiah',
    'esth': 'Esther',
    'job': 'Job',
    'ps': 'Psalms',
    'psa': 'Psalms',
    'psalm': 'Psalms',
    'prov': 'Proverbs',
    'eccl': 'Ecclesiastes',
    'song': 'Song of Solomon',
    'isa': 'Isaiah',
    'jer': 'Jeremiah',
    'lam': 'Lamentations',
    'ezek': 'Ezekiel',
    'dan': 'Daniel',
    'hos': 'Hosea',
    'joel': 'Joel',
    'amos': 'Amos',
    'obad': 'Obadiah',
    'jonah': 'Jonah',
    'mic': 'Micah',
    'nah': 'Nahum',
    'hab': 'Habakkuk',
    'zeph': 'Zephaniah',
    'hag': 'Haggai',
    'zech': 'Zechariah',
    'mal': 'Malachi',
    'matt': 'Matthew',
    'mark': 'Mark',
    'luke': 'Luke',
    'john': 'John',
    'acts': 'Acts',
    'rom': 'Romans',
    '1cor': '1 Corinthians',
    '2cor': '2 Corinthians',
    'gal': 'Galatians',
    'eph': 'Ephesians',
    'phil': 'Philippians',
    'col': 'Colossians',
    '1thess': '1 Thessalonians',
    '2thess': '2 Thessalonians',
    '1tim': '1 Timothy',
    '2tim': '2 Timothy',
    'titus': 'Titus',
    'philem': 'Philemon',
    'heb': 'Hebrews',
    'james': 'James',
    '1pet': '1 Peter',
    '2pet': '2 Peter',
    '1john': '1 John',
    '2john': '2 John',
    '3john': '3 John',
    'jude': 'Jude',
    'rev': 'Revelation'
  };

  // Normalize the input
  const normalized = book.toLowerCase().replace(/\s+/g, '');
  
  // Check for direct match in mappings
  return bookMappings[normalized] || book;
};

export const getPassage = async (reference: string, version: string = 'kjv'): Promise<BiblePassageResponse> => {
  try {
    // Input validation
    if (!reference || typeof reference !== 'string') {
      return {
        passage: [],
        reference: '',
        error: 'Invalid reference format'
      };
    }

    const parts = reference.split(' ');
    if (parts.length !== 2) {
      return {
        passage: [],
        reference,
        error: 'Invalid reference format. Please use format "Book Chapter:Verse" (e.g., "John 3:16")'
      };
    }

    const [book, chapterVerse] = parts;
    const normalizedBook = normalizeBookName(book);
    
    // Handle chapter-only references (e.g., "John 3")
    if (!chapterVerse.includes(':')) {
      const chapter = parseInt(chapterVerse, 10);
      if (isNaN(chapter)) {
        return {
          passage: [],
          reference,
          error: 'Invalid chapter number'
        };
      }

      const bibleData = bibleVersions[version.toLowerCase()];
      if (!bibleData?.[normalizedBook]?.[chapter]) {
        return {
          passage: [],
          reference,
          error: `Chapter ${chapter} not found in ${normalizedBook}`
        };
      }

      // Return all verses in the chapter
      const verses: BibleVerse[] = Object.entries(bibleData[normalizedBook][chapter])
        .map(([verseNum, text]) => ({
          book_id: normalizedBook,
          book_name: normalizedBook,
          chapter,
          verse: parseInt(verseNum, 10),
          text: text as string
        }))
        .sort((a, b) => a.verse - b.verse);

      return {
        passage: verses,
        reference: `${normalizedBook} ${chapter}`
      };
    }

    // Handle verse references (e.g., "John 3:16")
    const [chapter, verseRange] = chapterVerse.split(':');
    const chapterNum = parseInt(chapter, 10);
    
    if (isNaN(chapterNum)) {
      return {
        passage: [],
        reference,
        error: 'Invalid chapter number'
      };
    }

    const bibleData = bibleVersions[version.toLowerCase()];
    if (!bibleData) {
      return {
        passage: [],
        reference,
        error: `Bible version "${version}" not found`
      };
    }

    const bookData = bibleData[normalizedBook];
    if (!bookData) {
      return {
        passage: [],
        reference,
        error: `Book "${normalizedBook}" not found`
      };
    }

    const chapterData = bookData[chapterNum];
    if (!chapterData) {
      return {
        passage: [],
        reference,
        error: `Chapter ${chapterNum} not found in ${normalizedBook}`
      };
    }

    // Handle verse ranges (e.g., "16-20")
    const verses: BibleVerse[] = [];
    if (verseRange.includes('-')) {
      const [start, end] = verseRange.split('-').map(v => parseInt(v, 10));
      if (isNaN(start) || isNaN(end)) {
        return {
          passage: [],
          reference,
          error: 'Invalid verse range'
        };
      }

      for (let v = start; v <= end; v++) {
        if (chapterData[v]) {
          verses.push({
            book_id: normalizedBook,
            book_name: normalizedBook,
            chapter: chapterNum,
            verse: v,
            text: chapterData[v]
          });
        }
      }
    } else {
      const verseNum = parseInt(verseRange, 10);
      if (isNaN(verseNum)) {
        return {
          passage: [],
          reference,
          error: 'Invalid verse number'
        };
      }

      const verseText = chapterData[verseNum];
      if (!verseText) {
        return {
          passage: [],
          reference,
          error: `Verse ${verseNum} not found in ${normalizedBook} ${chapterNum}`
        };
      }

      verses.push({
        book_id: normalizedBook,
        book_name: normalizedBook,
        chapter: chapterNum,
        verse: verseNum,
        text: verseText
      });
    }

    return {
      passage: verses,
      reference: `${normalizedBook} ${chapter}:${verseRange}`
    };

  } catch (error) {
    return {
      passage: [],
      reference: reference,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const getAvailableBooks = async (version: string = 'kjv'): Promise<string[]> => {
  const bibleData = bibleVersions[version.toLowerCase()];
  if (!bibleData) {
    throw new Error(`Bible version ${version} not found`);
  }
  return Object.keys(bibleData).sort();
};

export const getAvailableChapters = async (book: string, version: string = 'kjv'): Promise<number[]> => {
  const normalizedBook = normalizeBookName(book);
  const bibleData = bibleVersions[version.toLowerCase()];
  if (!bibleData || !bibleData[normalizedBook]) {
    throw new Error(`Book ${normalizedBook} not found in version ${version}`);
  }
  return Object.keys(bibleData[normalizedBook]).map(Number).sort((a, b) => a - b);
};
