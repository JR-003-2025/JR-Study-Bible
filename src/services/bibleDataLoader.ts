import { BibleData, BibleVersion } from './types';
import { IndexedDBService } from './indexedDBService';

const dbService = new IndexedDBService();

export const availableVersions: BibleVersion[] = [
  { id: 'kjv', name: 'King James Version', abbreviation: 'KJV' },
  { id: 'asv', name: 'American Standard Version', abbreviation: 'ASV' },
  { id: 'bbe', name: 'Bible in Basic English', abbreviation: 'BBE' }
];

export async function loadBibleVersion(version: string): Promise<BibleData> {
  version = version.toLowerCase();
  
  // Try to get from IndexedDB first
  try {
    const cachedData = await dbService.getBibleVersion(version);
    if (cachedData && cachedData.books && Array.isArray(cachedData.books)) {
      return cachedData;
    }
  } catch (cacheError) {
    console.warn('Failed to load from cache:', cacheError);
  }

  try {
    // Dynamically import the Bible data
    const data = await import(`../../bible_data/${version}.json`);
    
    // Validate the data structure
    if (!data || !data.books || !Array.isArray(data.books)) {
      throw new Error(`Invalid Bible data format for version "${version}"`);
    }

    // Create a cloneable object by removing the module properties
    const bibleData: BibleData = JSON.parse(JSON.stringify({
      translation: data.translation || version.toUpperCase(),
      books: data.books
    }));

    // Store in IndexedDB for future use
    try {
      await dbService.setBibleVersion(version, bibleData);
    } catch (cacheError) {
      console.warn('Failed to cache Bible data:', cacheError);
    }

    return bibleData;
  } catch (error) {
    console.error(`Failed to load Bible version: ${version}`, error);
    throw new Error(`Bible version "${version}" could not be loaded`);
  }
}

export function clearBibleVersionCache() {
  return dbService.clearCache();
}
