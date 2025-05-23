import { getPassage, availableVersions } from './localBibleService';

import { BibleVerse, BiblePassageResponse, BibleVersion } from './types';

export const getDefaultVersionId = () => 'kjv';

export const getAvailableVersions = (): BibleVersion[] => {
  return availableVersions;
};

export const fetchBiblePassage = async (
  reference: string,
  version: string = 'kjv'
): Promise<BiblePassageResponse> => {
  try {
    return await getPassage(reference, version);
  } catch (error) {
    console.error('Error fetching Bible passage:', error);
    return {
      passage: [],
      reference,
      error: 'Failed to fetch Bible passage'
    };
  }
};