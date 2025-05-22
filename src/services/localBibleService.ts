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

export const getPassage = async (reference: string, version: string = 'kjv'): Promise<BiblePassageResponse> => {
  try {
    const [book, chapterVerse] = reference.split(' ');
    const [chapter, verse] = chapterVerse.split(':').map(Number);
    
    const bibleData = bibleVersions[version.toLowerCase()];
    if (!bibleData) {
      throw new Error(`Bible version ${version} not found`);
    }

    const bookData = bibleData[book];
    if (!bookData) {
      throw new Error(`Book ${book} not found`);
    }

    const chapterData = bookData[chapter];
    if (!chapterData) {
      throw new Error(`Chapter ${chapter} not found in ${book}`);
    }

    const verseData = chapterData[verse];
    if (!verseData) {
      throw new Error(`Verse ${verse} not found in ${book} ${chapter}`);
    }

    const bibleVerse: BibleVerse = {
      book_id: book,
      book_name: book,
      chapter: chapter,
      verse: verse,
      text: verseData
    };

    return {
      passage: [bibleVerse],
      reference: reference
    };
  } catch (error) {
    return {
      passage: [],
      reference: reference,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
