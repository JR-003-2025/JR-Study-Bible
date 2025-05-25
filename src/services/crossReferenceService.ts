import { BibleData } from './types';

interface CrossReference {
  sourceRef: string;
  targetRef: string;
  type: 'direct' | 'parallel' | 'topical';
  description?: string;
}

// This is a simplified cross-reference dataset. In a production app,
// you would want a more comprehensive database of cross-references.
const crossReferences: { [key: string]: CrossReference[] } = {
  'Genesis 1:1': [
    { sourceRef: 'Genesis 1:1', targetRef: 'John 1:1-3', type: 'parallel', description: 'Creation through the Word' },
    { sourceRef: 'Genesis 1:1', targetRef: 'Psalms 33:6', type: 'topical', description: 'Creation by God\'s word' },
    { sourceRef: 'Genesis 1:1', targetRef: 'Hebrews 11:3', type: 'direct', description: 'Creation by faith' },
  ],
  'John 3:16': [
    { sourceRef: 'John 3:16', targetRef: '1 John 4:9', type: 'parallel', description: 'God\'s love demonstrated' },
    { sourceRef: 'John 3:16', targetRef: 'Romans 5:8', type: 'topical', description: 'God\'s love for sinners' },
    { sourceRef: 'John 3:16', targetRef: 'Romans 8:32', type: 'direct', description: 'God giving His Son' },
  ],
  // Add more cross-references as needed
};

class CrossReferenceService {
  async getCrossReferences(reference: string): Promise<CrossReference[]> {
    // Normalize the reference format
    const normalizedRef = this.normalizeReference(reference);
    return crossReferences[normalizedRef] || [];
  }

  private normalizeReference(reference: string): string {
    // Basic reference normalization
    // In a real app, you'd want more robust reference parsing
    return reference.trim().replace(/\s+/g, ' ');
  }

  async searchByTopic(topic: string): Promise<CrossReference[]> {
    // Search through all cross-references for topic-related verses
    const allRefs = Object.values(crossReferences).flat();
    return allRefs.filter(ref => 
      ref.description?.toLowerCase().includes(topic.toLowerCase())
    );
  }

  async addCustomCrossReference(crossRef: CrossReference): Promise<void> {
    const existing = crossReferences[crossRef.sourceRef] || [];
    crossReferences[crossRef.sourceRef] = [...existing, crossRef];
  }
}

export const crossReferenceService = new CrossReferenceService();
export type { CrossReference };
