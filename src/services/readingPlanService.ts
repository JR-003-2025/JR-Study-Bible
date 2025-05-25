import { ReadingPlan, UserProgress } from './types';

const DB_NAME = 'BibleStudyDB';
const PLANS_STORE = 'readingPlans';
const PROGRESS_STORE = 'readingProgress';
const DB_VERSION = 3;

export class ReadingPlanService {
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
        
        if (!db.objectStoreNames.contains(PLANS_STORE)) {
          db.createObjectStore(PLANS_STORE, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
          const progressStore = db.createObjectStore(PROGRESS_STORE, { keyPath: 'id' });
          progressStore.createIndex('planId', 'planId', { unique: false });
        }
      };
    });
  }

  async addPlan(plan: ReadingPlan): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(PLANS_STORE, 'readwrite');
      const store = transaction.objectStore(PLANS_STORE);
      const request = store.put(plan);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getPlan(id: string): Promise<ReadingPlan | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(PLANS_STORE, 'readonly');
      const store = transaction.objectStore(PLANS_STORE);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAllPlans(): Promise<ReadingPlan[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(PLANS_STORE, 'readonly');
      const store = transaction.objectStore(PLANS_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async updateProgress(progress: UserProgress): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(PROGRESS_STORE, 'readwrite');
      const store = transaction.objectStore(PROGRESS_STORE);
      const request = store.put(progress);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getProgress(planId: string): Promise<UserProgress | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(PROGRESS_STORE, 'readonly');
      const store = transaction.objectStore(PROGRESS_STORE);
      const index = store.index('planId');
      const request = index.get(planId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async markDayComplete(planId: string, day: number): Promise<void> {
    const progress = await this.getProgress(planId);
    
    if (progress) {
      if (!progress.completedDays.includes(day)) {
        progress.completedDays.push(day);
        progress.lastReadDate = new Date().toISOString();
        await this.updateProgress(progress);
      }
    } else {
      await this.updateProgress({
        planId,
        completedDays: [day],
        startDate: new Date().toISOString(),
        lastReadDate: new Date().toISOString(),
      });
    }
  }
}

// Default reading plans that will be initialized when the database is empty
export const defaultReadingPlans: ReadingPlan[] = [
  {
    id: 'essential-journey',
    name: 'Essential Bible Journey',
    description: 'A 7-day journey through key passages of the Bible',
    duration: 7,
    readings: [
      { day: 1, references: ['Genesis 1-3'], isCompleted: false },
      { day: 2, references: ['Exodus 20'], isCompleted: false },
      { day: 3, references: ['Psalm 23', 'Psalm 51'], isCompleted: false },
      { day: 4, references: ['Isaiah 53'], isCompleted: false },
      { day: 5, references: ['Matthew 5-7'], isCompleted: false },
      { day: 6, references: ['John 3'], isCompleted: false },
      { day: 7, references: ['Romans 8'], isCompleted: false },
    ],
  },
  {
    id: 'new-testament',
    name: 'New Testament in 30 Days',
    description: 'Read through the key passages of the New Testament in 30 days',
    duration: 30,
    readings: [
      { day: 1, references: ['Matthew 1-4'], isCompleted: false },
      { day: 2, references: ['Matthew 5-7'], isCompleted: false },
      { day: 3, references: ['Matthew 8-10'], isCompleted: false },
      { day: 4, references: ['Matthew 11-13'], isCompleted: false },
      { day: 5, references: ['Matthew 14-17'], isCompleted: false },
      { day: 6, references: ['Matthew 18-20'], isCompleted: false },
      { day: 7, references: ['Matthew 21-23'], isCompleted: false },
      { day: 8, references: ['Matthew 24-25'], isCompleted: false },
      { day: 9, references: ['Matthew 26-28'], isCompleted: false },
      { day: 10, references: ['Mark 1-3'], isCompleted: false },
      { day: 11, references: ['Mark 4-6'], isCompleted: false },
      { day: 12, references: ['Mark 7-9'], isCompleted: false },
      { day: 13, references: ['Mark 10-13'], isCompleted: false },
      { day: 14, references: ['Mark 14-16'], isCompleted: false },
      { day: 15, references: ['Luke 1-3'], isCompleted: false },
      { day: 16, references: ['Luke 4-6'], isCompleted: false },
      { day: 17, references: ['Luke 7-9'], isCompleted: false },
      { day: 18, references: ['Luke 10-12'], isCompleted: false },
      { day: 19, references: ['Luke 13-15'], isCompleted: false },
      { day: 20, references: ['Luke 16-18'], isCompleted: false },
      { day: 21, references: ['Luke 19-21'], isCompleted: false },
      { day: 22, references: ['Luke 22-24'], isCompleted: false },
      { day: 23, references: ['John 1-3'], isCompleted: false },
      { day: 24, references: ['John 4-6'], isCompleted: false },
      { day: 25, references: ['John 7-9'], isCompleted: false },
      { day: 26, references: ['John 10-12'], isCompleted: false },
      { day: 27, references: ['John 13-15'], isCompleted: false },
      { day: 28, references: ['John 16-18'], isCompleted: false },
      { day: 29, references: ['John 19-21'], isCompleted: false },
      { day: 30, references: ['Acts 1-2'], isCompleted: false },
    ],
  },
];

export const readingPlanService = new ReadingPlanService();
