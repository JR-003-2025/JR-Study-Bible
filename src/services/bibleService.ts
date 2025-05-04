
import { toast } from "sonner";

// Types for Bible API
export type BibleVerse = {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
};

export type BibleChapter = {
  book_id: string;
  book_name: string;
  chapter: number;
  verses: BibleVerse[];
};

export type BiblePassageResponse = {
  passage: BibleVerse[];
  reference: string;
  error?: string;
};

// This function parses Bible references like "Genesis 1", "John 3:16", or "Romans 8:28-39"
export const parseReference = (reference: string): { 
  book: string; 
  chapter: number; 
  verseStart?: number; 
  verseEnd?: number 
} => {
  // Extract book name (everything before the first number)
  const bookMatch = reference.match(/^(\d?\s?[A-Za-z]+)/);
  const book = bookMatch ? bookMatch[0].trim() : "";
  
  // Extract chapter and verse references
  const numberMatch = reference.match(/(\d+)(?::(\d+))?(?:-(\d+))?/);
  
  if (!numberMatch) {
    return { book, chapter: 1 };
  }
  
  const chapter = parseInt(numberMatch[1], 10);
  const verseStart = numberMatch[2] ? parseInt(numberMatch[2], 10) : undefined;
  const verseEnd = numberMatch[3] ? parseInt(numberMatch[3], 10) : undefined;
  
  return { book, chapter, verseStart, verseEnd };
};

// Mock API - in a real app, this would connect to an actual Bible API
const mockBibleData: Record<string, Record<number, BibleVerse[]>> = {
  "Genesis": {
    1: [
      { book_id: "GEN", book_name: "Genesis", chapter: 1, verse: 1, text: "In the beginning God created the heaven and the earth." },
      { book_id: "GEN", book_name: "Genesis", chapter: 1, verse: 2, text: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters." },
      { book_id: "GEN", book_name: "Genesis", chapter: 1, verse: 3, text: "And God said, Let there be light: and there was light." },
      // More verses would be added here
    ],
    2: [
      { book_id: "GEN", book_name: "Genesis", chapter: 2, verse: 1, text: "Thus the heavens and the earth were finished, and all the host of them." },
      { book_id: "GEN", book_name: "Genesis", chapter: 2, verse: 2, text: "And on the seventh day God ended his work which he had made; and he rested on the seventh day from all his work which he had made." },
      { book_id: "GEN", book_name: "Genesis", chapter: 2, verse: 3, text: "And God blessed the seventh day, and sanctified it: because that in it he had rested from all his work which God created and made." },
      // More verses would be added here
    ],
    3: [
      { book_id: "GEN", book_name: "Genesis", chapter: 3, verse: 1, text: "Now the serpent was more subtil than any beast of the field which the LORD God had made. And he said unto the woman, Yea, hath God said, Ye shall not eat of every tree of the garden?" },
      { book_id: "GEN", book_name: "Genesis", chapter: 3, verse: 2, text: "And the woman said unto the serpent, We may eat of the fruit of the trees of the garden:" },
      { book_id: "GEN", book_name: "Genesis", chapter: 3, verse: 3, text: "But of the fruit of the tree which is in the midst of the garden, God hath said, Ye shall not eat of it, neither shall ye touch it, lest ye die." },
      // More verses would be added here
    ],
  },
  "Exodus": {
    20: [
      { book_id: "EXO", book_name: "Exodus", chapter: 20, verse: 1, text: "And God spake all these words, saying," },
      { book_id: "EXO", book_name: "Exodus", chapter: 20, verse: 2, text: "I am the LORD thy God, which have brought thee out of the land of Egypt, out of the house of bondage." },
      { book_id: "EXO", book_name: "Exodus", chapter: 20, verse: 3, text: "Thou shalt have no other gods before me." },
      { book_id: "EXO", book_name: "Exodus", chapter: 20, verse: 4, text: "Thou shalt not make unto thee any graven image, or any likeness of any thing that is in heaven above, or that is in the earth beneath, or that is in the water under the earth:" },
      // More verses would be added here
    ],
  },
  "Psalm": {
    23: [
      { book_id: "PSA", book_name: "Psalm", chapter: 23, verse: 1, text: "The LORD is my shepherd; I shall not want." },
      { book_id: "PSA", book_name: "Psalm", chapter: 23, verse: 2, text: "He maketh me to lie down in green pastures: he leadeth me beside the still waters." },
      { book_id: "PSA", book_name: "Psalm", chapter: 23, verse: 3, text: "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake." },
      { book_id: "PSA", book_name: "Psalm", chapter: 23, verse: 4, text: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me." },
      { book_id: "PSA", book_name: "Psalm", chapter: 23, verse: 5, text: "Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over." },
      { book_id: "PSA", book_name: "Psalm", chapter: 23, verse: 6, text: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever." },
    ],
  },
  "Isaiah": {
    53: [
      { book_id: "ISA", book_name: "Isaiah", chapter: 53, verse: 1, text: "Who hath believed our report? and to whom is the arm of the LORD revealed?" },
      { book_id: "ISA", book_name: "Isaiah", chapter: 53, verse: 2, text: "For he shall grow up before him as a tender plant, and as a root out of a dry ground: he hath no form nor comeliness; and when we shall see him, there is no beauty that we should desire him." },
      { book_id: "ISA", book_name: "Isaiah", chapter: 53, verse: 3, text: "He is despised and rejected of men; a man of sorrows, and acquainted with grief: and we hid as it were our faces from him; he was despised, and we esteemed him not." },
      { book_id: "ISA", book_name: "Isaiah", chapter: 53, verse: 4, text: "Surely he hath borne our griefs, and carried our sorrows: yet we did esteem him stricken, smitten of God, and afflicted." },
      { book_id: "ISA", book_name: "Isaiah", chapter: 53, verse: 5, text: "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed." },
      // More verses would be added here
    ],
  },
  "Matthew": {
    5: [
      { book_id: "MAT", book_name: "Matthew", chapter: 5, verse: 1, text: "And seeing the multitudes, he went up into a mountain: and when he was set, his disciples came unto him:" },
      { book_id: "MAT", book_name: "Matthew", chapter: 5, verse: 2, text: "And he opened his mouth, and taught them, saying," },
      { book_id: "MAT", book_name: "Matthew", chapter: 5, verse: 3, text: "Blessed are the poor in spirit: for theirs is the kingdom of heaven." },
      { book_id: "MAT", book_name: "Matthew", chapter: 5, verse: 4, text: "Blessed are they that mourn: for they shall be comforted." },
      // More verses would be added here
    ],
    6: [
      // Matthew 6 verses
    ],
    7: [
      // Matthew 7 verses
    ],
  },
  "John": {
    3: [
      { book_id: "JHN", book_name: "John", chapter: 3, verse: 1, text: "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:" },
      { book_id: "JHN", book_name: "John", chapter: 3, verse: 2, text: "The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him." },
      { book_id: "JHN", book_name: "John", chapter: 3, verse: 3, text: "Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God." },
      { book_id: "JHN", book_name: "John", chapter: 3, verse: 16, text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
      { book_id: "JHN", book_name: "John", chapter: 3, verse: 17, text: "For God sent not his Son into the world to condemn the world; but that the world through him might be saved." },
      // More verses would be added here
    ],
  },
  "Romans": {
    8: [
      { book_id: "ROM", book_name: "Romans", chapter: 8, verse: 1, text: "There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit." },
      { book_id: "ROM", book_name: "Romans", chapter: 8, verse: 2, text: "For the law of the Spirit of life in Christ Jesus hath made me free from the law of sin and death." },
      { book_id: "ROM", book_name: "Romans", chapter: 8, verse: 28, text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose." },
      { book_id: "ROM", book_name: "Romans", chapter: 8, verse: 29, text: "For whom he did foreknow, he also did predestinate to be conformed to the image of his Son, that he might be the firstborn among many brethren." },
      { book_id: "ROM", book_name: "Romans", chapter: 8, verse: 30, text: "Moreover whom he did predestinate, them he also called: and whom he called, them he also justified: and whom he justified, them he also glorified." },
      // More verses would be added here
    ],
  },
};

export const fetchBiblePassage = async (reference: string): Promise<BiblePassageResponse> => {
  try {
    // In a real app, this would make an API call to a Bible API service
    const { book, chapter, verseStart, verseEnd } = parseReference(reference);
    
    // Find the book in our mock data (case-insensitive)
    const bookKey = Object.keys(mockBibleData).find(
      b => b.toLowerCase() === book.toLowerCase()
    );
    
    if (!bookKey || !mockBibleData[bookKey][chapter]) {
      throw new Error(`Passage ${reference} not found`);
    }
    
    let verses = mockBibleData[bookKey][chapter];
    
    // Filter by verse range if specified
    if (verseStart !== undefined) {
      const endVerse = verseEnd || verseStart;
      verses = verses.filter(v => v.verse >= verseStart && v.verse <= endVerse);
    }
    
    return {
      passage: verses,
      reference: `${bookKey} ${chapter}${verseStart ? `:${verseStart}${verseEnd ? `-${verseEnd}` : ''}` : ''}`
    };
  } catch (error: any) {
    console.error("Error fetching Bible passage:", error);
    toast.error("Failed to load Bible passage", {
      description: error.message || "Please try again later"
    });
    return {
      passage: [],
      reference: "",
      error: error.message
    };
  }
};

// Get available books
export const getAvailableBooks = (): string[] => {
  return Object.keys(mockBibleData);
};

// Get available chapters for a book
export const getAvailableChapters = (book: string): number[] => {
  const bookKey = Object.keys(mockBibleData).find(
    b => b.toLowerCase() === book.toLowerCase()
  );
  
  if (!bookKey) return [];
  
  return Object.keys(mockBibleData[bookKey]).map(chapter => parseInt(chapter, 10));
};
