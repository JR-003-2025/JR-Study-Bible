import { BibleData, BibleSearchResult } from './types';
import { loadBibleVersion } from './bibleDataLoader';

interface SearchIndex {
  [word: string]: {
    [reference: string]: number;  // reference -> frequency
  };
}

export class BibleSearchService {
  private searchIndex: SearchIndex = {};
  private isIndexing = false;
  private indexedVersions: Set<string> = new Set();

  private normalizeText(text: string): string[] {
    return text.toLowerCase()
      .replace(/[.,;:?!'"\[\]()]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  async buildSearchIndex(version: string): Promise<void> {
    if (this.indexedVersions.has(version) || this.isIndexing) {
      return;
    }

    this.isIndexing = true;
    try {
      const bibleData = await loadBibleVersion(version);
      
      bibleData.books.forEach(book => {
        book.chapters.forEach(chapter => {
          chapter.verses.forEach(verse => {
            const reference = `${book.name} ${chapter.chapter}:${verse.verse}`;
            const words = this.normalizeText(verse.text);
            
            words.forEach(word => {
              if (!this.searchIndex[word]) {
                this.searchIndex[word] = {};
              }
              this.searchIndex[word][reference] = (this.searchIndex[word][reference] || 0) + 1;
            });
          });
        });
      });

      this.indexedVersions.add(version);
    } finally {
      this.isIndexing = false;
    }
  }

  async search(query: string, version: string, limit = 20): Promise<BibleSearchResult[]> {
    if (!this.indexedVersions.has(version)) {
      await this.buildSearchIndex(version);
    }

    const searchWords = this.normalizeText(query);
    if (searchWords.length === 0) return [];

    // Calculate scores for each reference
    const scores: { [reference: string]: number } = {};
    
    searchWords.forEach(word => {
      const wordMatches = this.searchIndex[word] || {};
      Object.entries(wordMatches).forEach(([reference, frequency]) => {
        scores[reference] = (scores[reference] || 0) + frequency;
      });
    });

    // Sort results by score
    const results = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([reference]) => {
        const [bookChapter, verse] = reference.split(':');
        const [book, chapter] = bookChapter.split(' ');
        return {
          reference,
          book,
          chapter: parseInt(chapter),
          verse: parseInt(verse),
          score: scores[reference]
        };
      });

    // Load verse text for results
    const bibleData = await loadBibleVersion(version);
    return results.map(result => ({
      ...result,
      text: bibleData.books
        .find(b => b.name === result.book)
        ?.chapters[result.chapter - 1]
        ?.verses[result.verse - 1]
        ?.text || ''
    }));
  }

  clearIndex(): void {
    this.searchIndex = {};
    this.indexedVersions.clear();
  }
}

export const bibleSearchService = new BibleSearchService();
