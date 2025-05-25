import { useState, useCallback, useEffect } from 'react';
import { getAvailableBooks, getAvailableChapters } from '@/services/localBibleService';
import { useQuery } from '@tanstack/react-query';

export type BibleReference = {
  book: string;
  chapter: string;
  verse?: string;
};

export function useBibleReference(initialReference: string) {
  const [reference, setReference] = useState<BibleReference>(() => {
    const parts = initialReference.split(' ');
    const [chapter, verse] = (parts[1] || '').split(':');
    return {
      book: parts[0] || 'Genesis',
      chapter: chapter || '1',
      verse: verse
    };
  });

  const { data: availableBooks = [] } = useQuery({
    queryKey: ['availableBooks'],
    queryFn: getAvailableBooks,
    staleTime: Infinity
  });

  const { data: availableChapters = [] } = useQuery({
    queryKey: ['availableChapters', reference.book],
    queryFn: () => getAvailableChapters(reference.book),
    staleTime: Infinity
  });

  const updateReference = useCallback((newRef: Partial<BibleReference>) => {
    setReference(prev => {
      const updated = { ...prev, ...newRef };
      
      // Reset chapter if book changes
      if (newRef.book && newRef.book !== prev.book) {
        const chaptersInBook = getAvailableChapters(newRef.book);
        updated.chapter = chaptersInBook[0] || '1';
        updated.verse = undefined;
      }
      
      return updated;
    });
  }, []);

  const nextChapter = useCallback(() => {
    const currentChapterIndex = availableChapters.indexOf(reference.chapter);
    if (currentChapterIndex < availableChapters.length - 1) {
      updateReference({ chapter: availableChapters[currentChapterIndex + 1] });
    } else {
      const currentBookIndex = availableBooks.indexOf(reference.book);
      if (currentBookIndex < availableBooks.length - 1) {
        const nextBook = availableBooks[currentBookIndex + 1];
        const nextBookChapters = getAvailableChapters(nextBook);
        updateReference({ book: nextBook, chapter: nextBookChapters[0] });
      }
    }
  }, [reference.book, reference.chapter, availableBooks, availableChapters, updateReference]);

  const previousChapter = useCallback(() => {
    const currentChapterIndex = availableChapters.indexOf(reference.chapter);
    if (currentChapterIndex > 0) {
      updateReference({ chapter: availableChapters[currentChapterIndex - 1] });
    } else {
      const currentBookIndex = availableBooks.indexOf(reference.book);
      if (currentBookIndex > 0) {
        const prevBook = availableBooks[currentBookIndex - 1];
        const prevBookChapters = getAvailableChapters(prevBook);
        updateReference({ 
          book: prevBook, 
          chapter: prevBookChapters[prevBookChapters.length - 1] 
        });
      }
    }
  }, [reference.book, reference.chapter, availableBooks, availableChapters, updateReference]);

  return {
    reference,
    updateReference,
    nextChapter,
    previousChapter,
    availableBooks,
    availableChapters
  };
}
