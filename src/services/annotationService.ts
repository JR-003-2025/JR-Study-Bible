interface VerseAnnotation {
  id: string;
  reference: string;
  type: 'highlight' | 'note' | 'bookmark';
  color?: string;
  note?: string;
  timestamp: number;
}

const DB_NAME = 'BibleStudyDB';
const STORE_NAME = 'annotations';
const DB_VERSION = 2;

class AnnotationService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('reference', 'reference', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  async addAnnotation(annotation: Omit<VerseAnnotation, 'id' | 'timestamp'>): Promise<string> {
    if (!this.db) await this.init();
    
    const id = `${annotation.reference}-${Date.now()}`;
    const fullAnnotation: VerseAnnotation = {
      ...annotation,
      id,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(fullAnnotation);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(id);
    });
  }

  async getAnnotationsForReference(reference: string): Promise<VerseAnnotation[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('reference');
      const request = index.getAll(reference);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAnnotationsByType(type: VerseAnnotation['type']): Promise<VerseAnnotation[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('type');
      const request = index.getAll(type);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async updateAnnotation(id: string, updates: Partial<VerseAnnotation>): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () => {
        const annotation = { ...getRequest.result, ...updates };
        const updateRequest = store.put(annotation);
        updateRequest.onerror = () => reject(updateRequest.error);
        updateRequest.onsuccess = () => resolve();
      };
    });
  }

  async deleteAnnotation(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const annotationService = new AnnotationService();
export type { VerseAnnotation };
