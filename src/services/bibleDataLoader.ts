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
  const cachedData = await dbService.getBibleVersion(version);
  if (cachedData) {
    return cachedData;
  }

  try {
    // Dynamically import the Bible data
    const data = await import(`../../bible_data/${version}.json`);
    const bibleData = data as BibleData;
    // Store in IndexedDB for future use
    await dbService.setBibleVersion(version, bibleData);
    return bibleData;
  } catch (error) {
    console.error(`Failed to load Bible version: ${version}`, error);
    throw new Error(`Bible version "${version}" could not be loaded`);
  }
}

export function clearBibleVersionCache() {
  return dbService.clearCache();
}
