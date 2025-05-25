import { loadBibleVersion } from './bibleDataLoader';
import type { BibleData } from './types';

interface VerseComparison {
  reference: string;
  versions: {
    [version: string]: {
      text: string;
      version: string;
    };
  };
}

class VerseComparisonService {
  private versionCache: { [key: string]: BibleData } = {};

  async compareVerses(reference: string, versions: string[]): Promise<VerseComparison> {
    const comparison: VerseComparison = {
      reference,
      versions: {}
    };

    // Parse the reference
    const [bookChapter, verse] = reference.split(':');
    const [book, chapter] = bookChapter.split(' ');

    // Load each version and extract the verse
    await Promise.all(
      versions.map(async (version) => {
        try {
          // Use cached version if available
          if (!this.versionCache[version]) {
            this.versionCache[version] = await loadBibleVersion(version);
          }

          const bibleData = this.versionCache[version];
          const verseText = bibleData.books
            .find(b => b.name.toLowerCase() === book.toLowerCase())
            ?.chapters[parseInt(chapter) - 1]
            ?.verses[parseInt(verse) - 1]
            ?.text;

          if (verseText) {
            comparison.versions[version] = {
              text: verseText,
              version: version.toUpperCase(),
            };
          }
        } catch (error) {
          console.error(`Error loading version ${version}:`, error);
        }
      })
    );

    return comparison;
  }

  async comparePassages(startRef: string, endRef: string, versions: string[]): Promise<VerseComparison[]> {
    // Parse references
    const [startBook, startChapterVerse] = startRef.split(' ');
    const [startChapter, startVerse] = startChapterVerse.split(':');
    
    const [endBook, endChapterVerse] = endRef.split(' ');
    const [endChapter, endVerse] = endChapterVerse.split(':');

    if (startBook !== endBook || startChapter !== endChapter) {
      throw new Error('Multi-chapter comparison not yet supported');
    }

    const comparisons: VerseComparison[] = [];
    for (let v = parseInt(startVerse); v <= parseInt(endVerse); v++) {
      const reference = `${startBook} ${startChapter}:${v}`;
      const comparison = await this.compareVerses(reference, versions);
      comparisons.push(comparison);
    }

    return comparisons;
  }

  clearCache(): void {
    this.versionCache = {};
  }
}

export const verseComparisonService = new VerseComparisonService();
export type { VerseComparison };
